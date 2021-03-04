<!--
  (c) 2021 Open AR Cloud
  This code is licensed under MIT license (see LICENSE for details)
-->

<!--
    Initializes and runs the AR session. Configuration will be according the data provided by the parent.
-->
<script>
    import { createEventDispatcher } from 'svelte';

    import * as pc from 'playcanvas';


    const message = (msg) => console.log(msg);

    // Used to dispatch events to parent
    const dispatch = createEventDispatcher();

    let canvas, textureCanvas, overlay;

    let app;
    let gl, glBinding, xrRefSpace;

    let captureImage = false;
    let hasPose = false;


    /**
     * Verifies that AR is available as required by the provided configuration data, and starts the session.
     */
    export function startAr() {
        app = new pc.Application(canvas, {
            mouse: new pc.Mouse(canvas),
            touch: new pc.TouchDevice(canvas),
            graphicsDeviceOptions: { alpha: true }
        });

        app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
        app.setCanvasResolution(pc.RESOLUTION_AUTO);
        app.graphicsDevice.maxPixelRatio = window.devicePixelRatio;
        app.start();

        app.xr.on('start', () => {
            message("Immersive AR session has started");
            createModel();
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

        camera.camera.startXr(pc.XRTYPE_AR, pc.XRSPACE_LOCALFLOOR, {
            optionalFeatures: ['camera-access'],
            callback: (error) => {
                if (error) {
                    message("WebXR Immersive AR failed to start: " + error.message);
                    throw new Error(error.message);
                }

                gl = canvas.getContext('webgl2', { xrCompatible: true });
                glBinding = new XRWebGLBinding(app.xr.session, gl);

                app.xr.session.requestReferenceSpace('local').then((refSpace) => {
                    xrRefSpace = refSpace;
                });
            }
        });
    }

    /**
     * Simple sample model to place for tests.
     */
    function createModel() {
        const cube = new pc.Entity();
        cube.addComponent("model", { type: "box" });
        cube.setLocalScale(0.5, 0.5, 0.5);
        cube.translate(0.5, 0.25, 0.5);
        app.root.addChild(cube);
    }

    /**
     * Trigger localisation of the device globally using a GeoPose service.
     */
    function startLocalisation() {
        captureImage = true;
    }

    function onUpdate(frame) {
        const pose = frame.getViewerPose(xrRefSpace);

        if (pose) {
            hasPose = true;

            for (let view of pose.views) {
                let viewport = app.xr.session.renderState.baseLayer.getViewport(view);

                if (captureImage) {
                    captureImage = false;

                    const texture = glBinding.getCameraImage(frame, view);
                    const image = createImageFromTexture(gl, texture, viewport.width / 2, viewport.height / 2);

                    // To verify if the image was captured correctly
                    // document.body.appendChild(image);
                }
            }
        }
    }

    /**
     * Converting a WebGLTexture to base64 encoded image.
     *
     * Copy paste from https://stackoverflow.com/questions/8191083/can-one-easily-create-an-html-image-element-from-a-webgl-texture-object
     * Pretty sure this can be optimized for this specific use.
     *
     * @param gl    Context of the canvas to use
     * @param texture       The texture to convert
     * @param width     Width of the resulting image
     * @param height        Height of the resulting image
     * @returns {string}        base64 encoded string of the image (will likely change)
     */
    function createImageFromTexture(gl, texture, width, height) {
        // Create a framebuffer backed by the texture
        const framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

        // Read the contents of the framebuffer
        const data = new Uint8Array(width * height * 4);
        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, data);

        gl.deleteFramebuffer(framebuffer);

        // Create a 2D canvas to store the result
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');

        // Copy the pixels to a 2D canvas
        const imageData = context.createImageData(width, height);
        imageData.data.set(data);
        context.putImageData(imageData, 0, 0);

        const img = new Image();
        img.src = canvas.toDataURL('image/jpeg');
        return img;
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
    <!--  TODO: Output info to move the phone around to get   -->
    {#if hasPose}
    <footer>
        <p>Usageinfo</p>
        <button on:click={startLocalisation}>Localize</button>
    </footer>
    {/if}
</aside>
