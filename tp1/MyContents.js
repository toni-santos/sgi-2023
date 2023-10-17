import * as THREE from "three";
import { MyAxis } from "./MyAxis.js";
import { MyRoom } from "./MyRoom.js";
import { MyCake } from "./MyCake.js";

/**
 *  This class contains the contents of out application
 */
class MyContents {
    /**
       constructs the object
       @param {MyApp} app The application object
    */
    constructor(app) {
        this.app = app;
        this.axis = null;
        this.room = null;
        this.table = null;
        this.activeCameraTarget = null;
        this.hasFog = false;
        this.controlsTargets = [];

        this.floorColor = 0x58595c;
        this.wallColor = 0xced2d9;
        this.planeShininess = 30;
        this.planeMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            specular: 0xffffff,
            emissive: "#000000",
            shininess: this.planeShininess
        });
    }

    /**
     * initializes the contents
     */
    init() {
        if (this.axis === null) {
            this.axis = new MyAxis(this);
            this.app.scene.add(this.axis);
            this.axis.visible = false;
        }

        if (this.room === null) {
            this.room = new MyRoom(
                this,
                70,
                12,
                this.floorColor,
                this.wallColor
            );
            this.app.scene.add(this.room);
        }

        this.dirLight = new THREE.DirectionalLight(0xf4e99b, 0.1);
        this.dirLight.position.set(0, 10, 0);
        this.app.scene.add(this.dirLight);

        // intensity 0 fog: can be enabled in GUI by increasing intensity
        this.app.scene.fog = new THREE.FogExp2(0x222222, 0);

        const planeTexture = new THREE.TextureLoader().load(
            "textures/dryfalls.jpg"
        );
        const planeMaterial = new THREE.MeshBasicMaterial({
            map: planeTexture,
            side: THREE.BackSide
        });

        this.farPlane = new THREE.PlaneGeometry(70, 70);
        this.plane = new THREE.Mesh(this.farPlane, planeMaterial);
        this.plane.position.set(0, -10, 40);
        this.app.scene.add(this.plane);
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0);
        this.app.scene.add(this.ambientLight);

        this.controlsTargets = {
            Origin: new THREE.Vector3(0, 0, 0),
            "Frame 1":
                this.room.table.frame.position ?? new THREE.Vector3(0, 0, 0),
            "Frame 2": this.room.frame.position ?? new THREE.Vector3(0, 0, 0),
            Box: this.room.box.position ?? new THREE.Vector3(0, 0, 0),
            Shelf: this.room.shelf.position ?? new THREE.Vector3(0, 0, 0),
            "Companion Cube":
                this.room.cube.position ?? new THREE.Vector3(0, 0, 0)
        };
        this.activeCameraTarget = "Origin";
    }

    toggleFog() {
        return this.hasFog
            ? (this.app.scene.fog.density = 0.03)
            : (this.app.scene.fog.density = 0);
    }

    changeControlsTarget(targetObj) {
        return this.app.controls.target.set(...this.controlsTargets[targetObj]);
    }

    /**
     * updates the contents
     * this method is called from the render method of the app
     *
     */
    update(t) {
        if (this.room.table.plate.object instanceof MyCake) {
            for (const candle of this.room.cake.candlesArray) {
                candle.update(t);
            }
        }
    }
}

export { MyContents };
