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
        console.log(this.track);
        this.playerVehicle.position.set(...this.track.points[0]);
        this.objects.push(this.playerVehicle);
        this.display();

        //this.app.scene.add(new MyTrack(this.app));
    }

    display() {
        for (const object of this.objects) {
            this.app.scene.add(object);
        }
    }

    update() {
        /*
        for (const point in this.track.points) {
            this.point.distanceTo(this.track.points[point]) > this.track.width ? console.log("outside ", point) : console.log("inside ", point);
        }
        */
    }
}

export { MyContents };
