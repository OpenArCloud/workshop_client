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

    let canvas;
    let overlay;

    let app;
    let glBinding;

    let captureImage = false;


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
            console.log('update');
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
            callback: function (err) {
                if (err) message("WebXR Immersive AR failed to start: " + err.message);
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
        const gl = canvas.getContext('webgl', { xrCompatible: true });
        glBinding = new XRWebGLBinding(app.xr.session, gl);

        captureImage = true;
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
    <footer>
        <p>Usageinfo</p>
        <button on:click={startLocalisation}>Localize</button>
    </footer>
</aside>
