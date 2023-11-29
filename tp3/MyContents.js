import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MyAxis } from "./MyAxis.js";
import { MyFileReader } from "./parser/MyFileReader.js";
import { MyGraph } from "./helper/MyGraph.js";
import { MyNurbsBuilder } from "./helper/MyNurbsBuilder.js";
import { MySceneData } from "./parser/MySceneData.js";
import { MyXMLContents } from "./MyXMLContents.js";
import { MyTrack } from "./custom/MyTrack.js";
import { MyVehicle } from "./custom/MyVehicle.js";

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
        this.xmlContents = new MyXMLContents(app);
        this.circuit = this.xmlContents.reader.objects["circuit"];
        this.track = this.xmlContents.reader.objects["track"];
        this.objects = [];
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
        this.point = new THREE.Vector3(6, 0, 6);
        this.playerVehicle = new MyVehicle(this.app);
        this.placeVehicle(this.playerVehicle);
        this.objects.push(this.playerVehicle);
        this.display();
        //this.app.scene.add(new MyTrack(this.app));
    }

    placeVehicle(vehicle) {
        vehicle.position.set(this.track.points[0].x, this.track.points[0].y + 1, this.track.points[0].z);
        const q = new THREE.Quaternion();
        const v = new THREE.Vector3();
        vehicle.getWorldDirection(v);
        q.setFromUnitVectors(v, this.track.curve.getTangent(0));
        const angle = new THREE.Euler();
        angle.setFromQuaternion(q);
        vehicle.setRotation(angle.y);
        vehicle.getWorldDirection(vehicle.orientation);
    }

    control() {
        if (this.app.pressedKeys.includes("w")) this.playerVehicle.changeVelocity(0.0008);
        if (this.app.pressedKeys.includes("s")) this.playerVehicle.changeVelocity(-0.0008);
        if (this.app.pressedKeys.includes("a")) this.playerVehicle.turn(Math.PI/200);
        if (this.app.pressedKeys.includes("d")) this.playerVehicle.turn(-Math.PI/200);
    }

    display() {
        for (const object of this.objects) {
            this.app.scene.add(object);
        }
    }

    update(t) {
        if (t === undefined) return;
        this.playerVehicle.update(t);
        this.playerVehicle.computeClosestPoint(this.track.points);
        this.playerVehicle.isOutOfBounds(this.track.points);
        if (this.app.followCamera) {
            const pos = new THREE.Vector3();
            this.playerVehicle.getWorldPosition(pos);
            this.app.activeCamera.position.copy(pos).add(
                new THREE.Vector3(
                    - 3 * Math.sin(this.playerVehicle.angle), 
                    1, 
                    - 3 * Math.cos(this.playerVehicle.angle)
                    ));
            this.app.controls.target.set(pos.x, pos.y, pos.z);
        }
        //console.log(this.playerVehicle.orientation);
        this.control();
    }
}

export { MyContents };
