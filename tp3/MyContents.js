import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MyAxis } from "./MyAxis.js";
import { MyFileReader } from "./parser/MyFileReader.js";
import { MyGraph } from "./helper/MyGraph.js";
import { MyNurbsBuilder } from "./helper/MyNurbsBuilder.js";
import { MySceneData } from "./parser/MySceneData.js";
import { MyXMLContents } from "./MyXMLContents.js";
import { MyTrack } from "./custom/MyTrack.js";

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

        this.app.scene.add(new MyTrack(this.app));
    }

    update() {

    }
}

export { MyContents };
