import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { MyContents } from "./MyContents.js";
import { MyGuiInterface } from "./MyGuiInterface.js";
import Stats from "three/addons/libs/stats.module.js";

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPixelatedPass } from 'three/addons/postprocessing/RenderPixelatedPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

/**
 * This class contains the application object
 */
class MyApp {
    /**
     * the constructor
     */
    constructor() {
        this.scene = null;
        this.stats = null;
        this.clock = null;
        this.pressedKeys = [];

        // camera related attributes
        this.activeCamera = null;
        this.activeCameraName = null;
        this.lastCameraName = null;
        this.cameras = [];
        this.frustumSize = 20;

        // other attributes
        this.renderer = null;
        this.controls = null;
        this.gui = null;
        this.axis = null;
        this.contents = null;
        this.followCamera = false;

        // postprocessing
        this.postProcessing = false;
        this.composer = null;
        this.outputPass = null
        this.renderPixelatedPass = null;

    }
    /**
     * initializes the application
     */
    init() {
        // Create an empty scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x101010);

        this.clock = new THREE.Clock();

        this.stats = new Stats();
        this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild(this.stats.dom);

        this.initCameras();
        this.setActiveCamera("Menu");

        // Create a renderer with Antialiasing
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor("#000000");
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.shadowMap.enabled = true;

        // Configure renderer size
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        // Append Renderer to DOM
        document.getElementById("canvas").appendChild(this.renderer.domElement);

        // manage window resizes
        window.addEventListener("resize", this.onResize.bind(this), false);
        this.setupControls();
        this.clock.start();

        // setup postprocessing
        if (this.postProcessing) {
            this.renderPixelatedPass = new RenderPixelatedPass( 4, this.scene, this.activeCamera );
            this.renderPixelatedPass.normalEdgeStrength = 0;
            this.renderPixelatedPass.depthEdgeStrength = 0.1;
            this.composer.addPass( this.renderPixelatedPass );    
        }

    }

    togglePP(value) {
        if (value) {
            if (this.renderPixelatedPass == null) {
                this.composer = new EffectComposer( this.renderer );
                this.composer.removePass(this.renderPixelatedPass);
                this.renderPixelatedPass = new RenderPixelatedPass( 4, this.scene, this.activeCamera );
                this.renderPixelatedPass.normalEdgeStrength = 0;
                this.renderPixelatedPass.depthEdgeStrength = 0.1;
                this.composer.addPass( this.renderPixelatedPass );
                this.outputPass = new OutputPass();
                this.composer.addPass( this.outputPass );
            } else {
                this.renderPixelatedPass = new RenderPixelatedPass( 4, this.scene, this.activeCamera );
                this.renderPixelatedPass.normalEdgeStrength = 0;
                this.renderPixelatedPass.depthEdgeStrength = 0.1;
                this.composer.addPass( this.renderPixelatedPass );
            }
        } else {
            this.composer.removePass(this.renderPixelatedPass);
            this.composer.removePass(this.outputPass);
            this.renderPixelatedPass = null;
        }
    }
    
    /**
     * initializes all the cameras
     */
    initCameras() {
        const aspect = window.innerWidth / window.innerHeight;

        // Create a basic perspective camera
        const perspective = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        perspective.position.set(10, 10, 3);
        this.cameras["Perspective"] = perspective;

        const menu = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        menu.layers.enableAll();
        this.cameras["Menu"] = menu;
        
        const play = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        play.position.set(0, 10, 0);
        this.cameras["Play"] = play;
    }

    /**
     * sets the active camera by name
     * @param {String} cameraName
     */
    setActiveCamera(cameraName) {
        this.activeCameraName = cameraName;
        this.activeCamera = this.cameras[this.activeCameraName];
    }

    /**
     * updates the active camera if required
     * this function is called in the render loop
     * when the active camera name changes
     * it updates the active camera and the controls
     */
    updateCameraIfRequired() {
        // camera changed?
        if (this.lastCameraName !== this.activeCameraName) {
            this.lastCameraName = this.activeCameraName;
            this.activeCamera = this.cameras[this.activeCameraName];
            document.getElementById("camera").innerHTML = this.activeCameraName;

            // call on resize to update the camera aspect ratio
            // among other things
            this.onResize();

            // update effects
            if (this.postProcessing) {
                this.composer.removePass(this.renderPixelatedPass);
                this.renderPixelatedPass = new RenderPixelatedPass( 5, this.scene, this.activeCamera );
                this.renderPixelatedPass.normalEdgeStrength = 0;
                this.renderPixelatedPass.depthEdgeStrength = 0.1;
                this.composer.addPass( this.renderPixelatedPass );    
            }

            // are the controls yet?
            if (this.controls === null) {
                // Orbit controls allow the camera to orbit around a target.
                this.controls = new OrbitControls(
                    this.activeCamera,
                    this.renderer.domElement
                );
                this.controls.enableZoom = true;
                if (this.activeCameraName === "Menu") {
                    // this.controls.enabled = false;
                }
                this.controls.update();
                this.contents?.xmlContents?.defineControls();
            } else {
                this.controls.object = this.activeCamera;
            }
        }
    }

    /**
     * the window resize handler
     */
    onResize() {
        if (this.activeCamera !== undefined && this.activeCamera !== null) {
            this.activeCamera.aspect = window.innerWidth / window.innerHeight;
            this.activeCamera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            if (this.composer)
                this.composer.setSize( window.innerWidth, window.innerHeight );
        }
    }
    /**
     *
     * @param {MyContents} contents the contents object
     */
    setContents(contents) {
        this.contents = contents;
        this.contents.update();
    }

    /**
     * @param {MyGuiInterface} contents the gui interface object
     */
    setGui(gui) {
        this.gui = gui;
    }

    setupControls() {
        document.onkeydown = (e) => {
            if (!["w", "a", "s", "d", " ", "p"].includes(e.key)) return;
            /**
            if (e.key == "w") {
                console.log("w");
            }
            if (e.key === "a") {
                console.log("a");
            }
            if (e.key === "s") {
                console.log("s");
            }
            if (e.key === "d") {
                console.log("d");
            }
            */
            if (e.key === " ") {
                this.followCamera = !this.followCamera;
            }
            if (!this.pressedKeys.includes(e.key)) this.pressedKeys.push(e.key);
        };
        
        document.onkeyup = (e) => {
            if (!["w", "a", "s", "d", "p"].includes(e.key)) return;
            /**
            if (e.key == "w") {
                console.log("w");
            }
            if (e.key === "a") {
                console.log("a");
            }
            if (e.key === "s") {
                console.log("s");
            }
            if (e.key === "d") {
                console.log("d");
            }
            */
            if (this.pressedKeys.includes(e.key)) this.pressedKeys = this.pressedKeys.filter(key => key !== e.key);
        };
    }

    /**
     * the main render function. Called in a requestAnimationFrame loop
     */
    render() {
        this.stats.begin();
        this.updateCameraIfRequired();

        // update the animation if contents were provided
        if (this.activeCamera !== undefined && this.activeCamera !== null) {
            this.contents.update(this.clock.getElapsedTime());
        }

        // required if controls.enableDamping or controls.autoRotate are set to true
        this.controls.update();

        // render the scene
        this.renderer.render(this.scene, this.activeCamera);

        // subsequent async calls to the render loop
        requestAnimationFrame(this.render.bind(this));

        this.lastCameraName = this.activeCameraName;
        if (this.composer)
            this.composer.render();
        this.stats.end();
    }
}

export { MyApp };
