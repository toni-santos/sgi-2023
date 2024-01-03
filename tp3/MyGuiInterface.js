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
        this.datgui.add(this.contents, "paused")
        .name("Pause").onChange((value) => {
            this.contents.changePauseState(value);
        });
        const postProcessingFolder = this.datgui.addFolder("Post Processing");
        postProcessingFolder
            .add(this.app, "postProcessing")
            .name("Post Processing").onChange((value) => {
                this.app.togglePP(value);
            });
        const helpersFolder = this.datgui.addFolder("Display Helpers")
        helpersFolder.add(this.contents, "visibleBoxes")
        .name("Toggle Bounding Boxes").onChange((value) => {
            this.contents.collidableObjects?.forEach((obj) => {
                obj.toggleCollisionMesh(value);
            });
            if (this.contents.playerVehicle) this.contents.playerVehicle.toggleCollisionMesh(value);
            if (this.contents.cpuVehicle) this.contents.cpuVehicle.toggleCollisionMesh(value);
        });
        helpersFolder.add(this.contents, "visibleRoute")
        .name("Toggle CPU Route").onChange((value) => {
            if (this.contents.route) this.contents.route.visible = value;
        });
    }
}

export { MyGuiInterface };
