<!--
  (c) 2021 Open AR Cloud
  This code is licensed under MIT license (see LICENSE for details)
-->

<!--
    Initializes and runs the AR session. Configuration will be according the data provided by the parent.
-->
<script>
    import { createEventDispatcher } from 'svelte';

    import '@thirdparty/playcanvas.min.js';
    import {v4 as uuidv4} from 'uuid';

    import { sendRequest, objectEndpoint, validateRequest } from 'gpp-access';
    import GeoPoseRequest from 'gpp-access/request/GeoPoseRequest.js';
    import ImageOrientation from 'gpp-access/request/options/ImageOrientation.js';
    import { IMAGEFORMAT } from 'gpp-access/GppGlobals.js';

    import { initialLocation, availableContentServices, currentMarkerImage,
        currentMarkerImageWidth, selectedGeoPoseService } from '@src/stateStore';
    import { createImageFromTexture, wait, ARMODES } from "@core/common";
    import { createModel, createPlaceholder } from '@core/modelTemplates';
    import { calculateDistance, fakeLocationResult, calculateEulerRotation, toDegrees } from '@core/locationTools';

    import { initializeGLCube, drawScene } from '@core/texture';
    import ArCloudOverlay from "./dom-overlays/ArCloudOverlay.svelte";
    import MarkerOverlay from "./dom-overlays/MarkerOverlay.svelte";

    export let activeArMode;


    const message = (msg) => console.log(msg);

    // Used to dispatch events to parent
    const dispatch = createEventDispatcher();

    let canvas, overlay;

    let app;

    let doCaptureImage = false;
    let showFooter = false, hasPose = false, isLocalizing = false, isLocalized = false;

    let xrRefSpace = null;

    let gl = null;
    let glBinding = null;
    let cameraShader = null;

    let trackedImage, trackedImageObject;


    /**
     * Verifies that AR is available as required by the provided configuration data, and starts the session.
     */
    export function startAr() {
        showFooter = true;

        app = new pc.Application(canvas, {
            mouse: new pc.Mouse(canvas),
            touch: new pc.TouchDevice(canvas),
            graphicsDeviceOptions: {alpha: true}
        });

        app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
        app.setCanvasResolution(pc.RESOLUTION_AUTO);
        app.graphicsDevice.maxPixelRatio = window.devicePixelRatio;
        app.start();

        app.xr.on('start', () => {
            message("Immersive AR session has started");
        });

        app.xr.on('update', (frame) => {
            onUpdate(frame);
        })

        app.xr.on('end', () => {
            message("Immersive AR session has ended");

            app = null;
            dispatch('arSessionEnded');
        });

        app.xr.on('available:' + pc.XRTYPE_AR, (available) => {
            message("Immersive AR is " + (available ? 'available' : 'unavailable'));
            if (available && !app.xr.active) {
                const camera = setupEnvironment();
                startSession(camera);
            }
        });

        window.addEventListener("resize", () => {
            if (app) app.resizeCanvas(canvas.width, canvas.height);
        });
    }

    /**
     * Set up the 3D environment as required according to the current real environment.*
     */
    function setupEnvironment() {
        // create camera
        const camera = new pc.Entity();
        camera.addComponent('camera', {
            clearColor: new pc.Color(0, 0, 0, 0),
            farClip: 10000
        });
        app.root.addChild(camera);

        const light = new pc.Entity();
        light.addComponent("light", {
            type: "spot",
            range: 30
        });
        light.translate(0, 10, 0);
        app.root.addChild(light);

        return camera;
    }

    /**
     * Setup required AR features and start the XRSession.
     */
    function startSession(camera) {
        app.xr.domOverlay.root = overlay;

        let options = {};

        if (activeArMode === ARMODES.oscp) {
            options = {
                requiredFeatures: ['dom-overlay', 'camera-access'],
                callback: oscpModeCallback
            }
            camera.camera.startXr(pc.XRTYPE_AR, pc.XRSPACE_LOCALFLOOR, options);
        } else if (activeArMode === ARMODES.marker) {
            options = {
                requiredFeatures: ['image-tracking'],
                imageTracking: true,
                callback: markerModeCallback
            }
            setupMarkers()
                .then(() => camera.camera.startXr(pc.XRTYPE_AR, pc.XRSPACE_LOCALFLOOR, options));
        }
    }

    /**
     * Load marker and configure marker tracking.
     */
    function setupMarkers() {
        return fetch(`/media/${$currentMarkerImage}`)
            .then(response => response.blob())
            .then(blob => {
                trackedImage = app.xr.imageTracking.add(blob, $currentMarkerImageWidth);
            })
            .catch(error => console.log(error));
    }

    /**
     * Executed when XRSession was successfully created for AR mode 'marker'.
     */
    function markerModeCallback(error) {
        if (error) {
            message("WebXR Immersive AR failed to start: " + error.message);
            throw new Error(error.message);
        }

        app.xr.session.requestReferenceSpace('local').then((refSpace) => {
            xrRefSpace = refSpace;
        });
    }

    /**
     * Executed when XRSession was successfully created for AR mode 'oscp'.
     */
    function oscpModeCallback(error) {
        if (error) {
            message("WebXR Immersive AR failed to start: " + error.message);
            throw new Error(error.message);
        }

        gl = canvas.getContext('webgl2', {xrCompatible: true});
        glBinding = new XRWebGLBinding(app.xr.session, gl);

        // cameraShader = initializeGLCube(gl);

        app.xr.session.updateRenderState({baseLayer: new XRWebGLLayer(app.xr.session, gl)});
        app.xr.session.requestReferenceSpace('local').then((refSpace) => {
            xrRefSpace = refSpace;
        });
    }

    /**
     * Trigger localisation of the device globally using a GeoPose service.
     */
    function startLocalisation() {
        doCaptureImage = true;
        isLocalizing = true;
    }

    /**
     * Animation loop.
     *
     * @param frame
     */
    function onUpdate(frame) {
        const localPose = frame.getViewerPose(xrRefSpace);

        if (activeArMode === ARMODES.oscp && localPose) {
            hasPose = true;
            handlePose(localPose, frame);
        } else if (activeArMode === ARMODES.marker) {
            handleMarker();
        }
    }

    /**
     * Handles update loop when marker mode is used.
     */
    function handleMarker() {
        if (trackedImage && trackedImage.tracking) {
            if (!trackedImageObject) {
                trackedImageObject = createModel();
                app.root.addChild(trackedImageObject);
            }

            trackedImageObject.setPosition(trackedImage.getPosition());
            trackedImageObject.setRotation(trackedImage.getRotation());
        }
    }

    /**
     * Handles update loop when ARCloud mode is used.
     *
     * @param localPose      The pose of the device as reported by the XRFrame
     * @param frame     The XRFrame provided to the update loop
     */
    function handlePose(localPose, frame) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, app.xr.session.renderState.baseLayer.framebuffer);

        for (let view of localPose.views) {
            let viewport = app.xr.session.renderState.baseLayer.getViewport(view);
            gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);

            if (doCaptureImage) {
                doCaptureImage = false;

                const image = captureImage(frame, view, viewport, localPose.cameraViews[0]);
                localize(localPose, image, viewport.width, viewport.height)
                    // When localisation didn't already provide content, needs to be requested here
                    .then(([geoPose, data]) => placeContent(localPose, geoPose, data));
            }
        }
    }

    /**
     * Get the camera image from WebXR.
     *
     * @param frame  XRFrame        Provides access to the information needed in order to render a single frame of
     *                              animation for an XRSession describing a VR or AR sccene
     * @param view  XRView      Provides information describing a single view into the XR scene for a specific frame,
     *                          providing orientation and position information for the viewpoint
     * @param viewport  XRViewPort      Provides properties used to describe the size and position of the current
     *                                  viewport within the XRWebGLLayer being used to render the 3D scene
     * @param cameraView  WebGLTexture      The texture with the camera image
     */
    function captureImage(frame, view, viewport, cameraView) {
        cameraShader = initializeGLCube(gl);
        const cameraTexture = glBinding.getCameraImage(frame, cameraView);
        drawScene(gl, cameraTexture, view);

        const image = createImageFromTexture(gl, cameraTexture, viewport.width, viewport.height);

        // WebGL shader was installed earlier to get the camera image rendered onto the texture
        gl.deleteProgram(cameraShader);
        cameraShader = null;

        return image;
    }

    /**
     * Does the actual localisation with the image shot before and the preselected GeoPose service.
     *
     * When request is successful, content reported from the content discovery server will be placed. When
     * request is unsuccessful, user is offered to localize again or use a marker image as an alternative.
     *
     * @param localPose  XRPose      Pose of the device as reported by the XRFrame
     * @param image  string     Camera image to use for localisation
     * @param width  Number     Width of the camera image
     * @param height  Number    Height of the camera image
     */
    function localize(localPose, image, width, height) {
        return new Promise((resolve, reject) => {
            const geoPoseRequest = new GeoPoseRequest(uuidv4())
                .addCameraData(IMAGEFORMAT.JPG, [width, height], image.split(',')[1], 0, new ImageOrientation(false, 0))
                .addLocationData($initialLocation.lat, $initialLocation.lon, 0, 0, 0, 0, 0);

            // Services haven't implemented recent changes to the protocol yet
            validateRequest(false);

            sendRequest(`${$availableContentServices[0].url}/${objectEndpoint}`, JSON.stringify(geoPoseRequest))
                .then(data => {
                    isLocalized = true;
                    wait(1000).then(showFooter = false);

                    if ('scrs' in data) {
                        resolve([data.geopose.pose, data.scrs]);
                    }
                })
                .catch(error => {
                    // TODO: Offer marker alternative
                    isLocalizing = false;
                    console.error(error);
                    reject(error);
                });

/*
            {
                // Stored SCD response for development
                console.log('fake localisation');
                isLocalized = true;
                wait(1000).then(showFooter = false);
                resolve([fakeLocationResult.geopose.pose, fakeLocationResult.scrs])
            }
*/
        });
    }

    /**
     *  Places the content provided by a call to a Spacial Content Discovery server.
     *
     * @param localPose XRPose      The pose of the device when localisation was started in local reference space
     * @param globalPose  GeoPose       The global GeoPose as returned from GeoPose service
     * @param scr  SCR Spatial      Content Record with the result from the server request
     */
    function placeContent(localPose, globalPose, scr) {
        const localPosition = localPose.transform.position;

        scr.forEach(record => {
            // Augmented City special path for the GeoPose. Should be just 'record.content.geopose'
            const objectPose = record.content.geopose.pose;

            // This is difficult to generalize, because there are no types defined yet.
            if (record.content.type === 'placeholder') {
                const contentPosition = calculateDistance(globalPose, objectPose);
                const placeholder = createPlaceholder(record.content.keywords);
                placeholder.setPosition(contentPosition.x + localPosition.x,contentPosition.y + localPosition.y,
                    contentPosition.z + localPosition.z);

                const rotation = calculateEulerRotation(globalPose.quaternion, localPose.transform.orientation);
                placeholder.rotate(toDegrees(rotation[0]), toDegrees(rotation[1]), toDegrees(rotation[2]));

                app.root.addChild(placeholder);
            }
        })
    }
</script>


<style>
    canvas {
        width: 100vw;
        height: 100vh;
    }

    aside footer {
        position: absolute;
        bottom: 0;

        margin: var(--ui-margin);
        padding: var(--ui-margin);

        width: calc(100vw - 4 * var(--ui-margin));

        border: 1px solid black;
        border-radius: var(--ui-radius);
        background-color: white;

        text-align: center;
    }
</style>


<canvas id='application' bind:this={canvas}></canvas>
<aside bind:this={overlay} on:beforexrselect={(event) => event.preventDefault()}>
    {#if showFooter}
        <footer>
            {#if activeArMode === ARMODES.oscp}
            <ArCloudOverlay hasPose="{hasPose}" isLocalizing="{isLocalizing}" isLocalized="{isLocalized}"
                        on:startLocalisation={startLocalisation} />
            {:else if activeArMode === ARMODES.marker}
                <MarkerOverlay />
            {:else}
                <p>Somethings wrong...</p>
                <p>Apologies.</p>
            {/if}
        </footer>
    {/if}
</aside>
