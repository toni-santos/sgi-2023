import * as THREE from "three";
import { MyAxis } from "./MyAxis.js";
import { MyRoom } from "./MyRoom.js";

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

        // box related attributes
        this.boxMesh = null;
        this.boxMeshSize = 1.0;
        this.boxEnabled = false;
        this.lastBoxEnabled = null;
        this.boxDisplacement = null;
        this.boxScaling = null;

        // plane related attributes
        this.diffusePlaneColor = "#00ffff";
        this.specularPlaneColor = "#777777";
        this.floorColor = 0x58595c;
        this.wallColor = 0xced2d9;
        this.planeShininess = 30;
        this.planeMaterial = new THREE.MeshPhongMaterial({
            color: this.diffusePlaneColor,
            specular: this.diffusePlaneColor,
            emissive: "#000000",
            shininess: this.planeShininess
        });
    }

    /**
     * builds the box mesh with material assigned
     */
    buildBox() {
        let boxMaterial = new THREE.MeshPhongMaterial({
            color: "#ffff77",
            specular: "#000000",
            emissive: "#000000",
            shininess: 90
        });

        // Create a Cube Mesh with basic material
        let box = new THREE.BoxGeometry(
            this.boxMeshSize,
            this.boxMeshSize,
            this.boxMeshSize
        );
        this.boxDisplacement = new THREE.Vector3(0, 2, 0);
        this.boxScaling = new THREE.Vector3(1, 1, 2);
        this.boxMesh = new THREE.Mesh(box, boxMaterial);
        this.boxMesh.scale.copy(this.boxScaling);
    }

    /**
     * initializes the contents
     */
    init() {
        // create once
        if (this.axis === null) {
            // create and attach the axis to the scene
            this.axis = new MyAxis(this);
            this.app.scene.add(this.axis);
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

        // add a point light on top of the model
        this.pointLight = new THREE.PointLight(0xffffff, 0, 0);
        this.pointLight.position.set(3, 10, 6);
        this.app.scene.add(this.pointLight);

        const lightPos = new THREE.Vector3(-10, 10, 0);
        this.leftLight = new THREE.SpotLight(0xffffff, 0.8, 0, Math.PI, 1, 0.8);
        this.leftLight.position.set(lightPos.x, lightPos.y, lightPos.z);
        this.app.scene.add(this.leftLight);
        this.leftLightTarget = new THREE.Object3D();
        this.leftLightTarget.position.set(lightPos.x, 0, lightPos.z);
        this.leftLight.target = this.leftLightTarget;

        this.rightLight = new THREE.SpotLight(0xffffff, 0.8, 0, Math.PI, 1, 0.8);
        this.rightLight.position.set(-lightPos.x, lightPos.y, lightPos.z);
        this.app.scene.add(this.rightLight);
        this.rightLightTarget = new THREE.Object3D();
        this.rightLightTarget.position.set(-lightPos.x, 0, lightPos.z);
        this.rightLight.target = this.rightLightTarget;

        this.dirLight = new THREE.DirectionalLight(0xF4E99B, 0.2);
        this.dirLight.position.set(0, 10, 0);
        this.app.scene.add(this.dirLight);

        // this.app.scene.fog = new THREE.FogExp2(0x222222, 0.01);
        
        const planeTexture = new THREE.TextureLoader().load("textures/dryfalls.jpg")
        const planeMaterial = new THREE.MeshBasicMaterial( {
            color: 0xffffff,
            map: planeTexture,
            side: THREE.BackSide
        } );

        this.farPlane = new THREE.PlaneGeometry(200, 200);
        this.plane = new THREE.Mesh(this.farPlane, planeMaterial);
        this.plane.position.set(0, -21, 100);
        this.app.scene.add(this.plane);
        // add an ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.01);
        this.app.scene.add(ambientLight);

        this.buildBox();

        // Create a Plane Mesh with basic material
    }

    /**
     * updates the diffuse plane color and the material
     * @param {THREE.Color} value
     */
    updateDiffusePlaneColor(value) {
        this.diffusePlaneColor = value;
        this.planeMaterial.color.set(this.diffusePlaneColor);
    }
    /**
     * updates the specular plane color and the material
     * @param {THREE.Color} value
     */
    updateSpecularPlaneColor(value) {
        this.specularPlaneColor = value;
        this.planeMaterial.specular.set(this.specularPlaneColor);
    }
    /**
     * updates the plane shininess and the material
     * @param {number} value
     */
    updatePlaneShininess(value) {
        this.planeShininess = value;
        this.room.planeMaterial.shininess = this.planeShininess;
    }

    /**
     * rebuilds the box mesh if required
     * this method is called from the gui interface
     */
    rebuildBox() {
        // remove boxMesh if exists
        if (this.boxMesh !== undefined && this.boxMesh !== null) {
            this.app.scene.remove(this.boxMesh);
        }
        this.buildBox();
        this.lastBoxEnabled = null;
    }

    /**
     * updates the box mesh if required
     * this method is called from the render method of the app
     * updates are trigered by boxEnabled property changes
     */
    updateBoxIfRequired() {
        if (this.boxEnabled !== this.lastBoxEnabled) {
            this.lastBoxEnabled = this.boxEnabled;
            if (this.boxEnabled) {
                this.app.scene.add(this.boxMesh);
            } else {
                this.app.scene.remove(this.boxMesh);
            }
        }
    }

    /**
     * updates the contents
     * this method is called from the render method of the app
     *
     */
    update() {
        // check if box mesh needs to be updated
        this.updateBoxIfRequired();

        // sets the box mesh position based on the displacement vector
        this.boxMesh.position.x = this.boxDisplacement.x;
        this.boxMesh.position.y = this.boxDisplacement.y;
        this.boxMesh.position.z = this.boxDisplacement.z;
    }
}

export { MyContents };
