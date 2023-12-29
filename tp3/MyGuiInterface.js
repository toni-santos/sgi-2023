import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { MyApp } from "./MyApp.js";
import { MyContents } from "./MyContents.js";
import * as THREE from "three";

/**
    This class customizes the gui interface for the app
*/
class MyGuiInterface {
    /**
     *
     * @param {MyApp} app The application object
     */
    constructor(app) {
        this.app = app;
        this.datgui = new GUI();
        this.contents = null;
        this.defaultConf = {
            lensColor: new THREE.Color(1, 0, 0),
            eLightColor: new THREE.Color(1, 0, 0)
        };
    }

    /**
     * Set the contents object
     * @param {MyContents} contents the contents objects
     */
    setContents(contents) {
        this.contents = contents;
        // this.xmlContents = contents.xmlContents;
        this.defaultConf["debug"] = () => this.contents.printDebugInfo();
    }

    /**
     * Initialize the gui interface
     */
    init() {
        const postProcessingFolder = this.datgui.addFolder("Post Processing");
        postProcessingFolder
            .add(this.app, "postProcessing")
            .name("Post Processing").onChange((value) => {
                this.app.togglePP(value);
            });
        const cameraFolder = this.datgui.addFolder("Camera");
        // cameraFolder
        //     .add(
        //         this.app,
        //         "activeCameraName",
        //         Object.keys(this.xmlContents.cameras)
        //     )
        //     .name("Active Camera");
        // cameraFolder
        //     .add(
        //         this.contents,
        //         "activeCameraTarget",
        //         Object.keys(this.xmlContents.controlsTargets)
        //     )
        //     .name("Active Target")
        //     .onChange((value) => {
        //         this.xmlContents.changeControlsTarget(value);
        //     });
        cameraFolder.open();
    }
}

export { MyGuiInterface };
