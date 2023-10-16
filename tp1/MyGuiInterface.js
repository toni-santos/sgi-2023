import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { MyApp } from "./MyApp.js";
import { MyContents } from "./MyContents.js";

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
    }

    /**
     * Set the contents object
     * @param {MyContents} contents the contents objects
     */
    setContents(contents) {
        this.contents = contents;
    }

    /**
     * Initialize the gui interface
     */
    init() {
        const planeFolder = this.datgui.addFolder("Plane");
        planeFolder.add(this.contents.room.roofMesh, "visible", true).name("enable roof");
        planeFolder.open();

        // adds a folder to the gui interface for the camera
        const cameraFolder = this.datgui.addFolder("Camera");
        cameraFolder
            .add(this.app, "activeCameraName", [
                "Perspective",
                "Wide Perspective",
                "Left",
                "Right",
                "Top",
                "Bottom",
                "Front",
                "Back"
            ])
            .name("active camera");

        cameraFolder.open();

        const lightFolder = this.datgui.addFolder("Standard Lights");
        lightFolder.add(this.contents.ambientLight, "intensity", 0, 1).name("ambient light intensity");
        lightFolder.open();

        const cakeLightFolder = this.datgui.addFolder("Cake Light");
        cakeLightFolder.add(this.contents.room.cakeLight, "visible", true).name("enable");
        cakeLightFolder.add(this.contents.room.cakeLight.light, "intensity", 0, 100).name("intensity");
        cakeLightFolder.add(this.contents.room, "rotationAngle", 0, 2*Math.PI).name("rotation angle").onChange((value) => {
            this.contents.room.rotateCakeLight(value);
        });
        cakeLightFolder.add(this.contents.room, "rotationHeight", -5, 5).name("rotation height").onChange((value) => {
            this.contents.room.changeCakeHeight(value);
        });
        cakeLightFolder.add(this.contents.room, "rotationRadius", 0, 10).name("rotation radius").onChange((value) => {
            this.contents.room.radiusCakeLight(value);
        });
        cakeLightFolder.addColor(this.contents.room.cakeLight, "color").onChange((value) => {
            this.contents.room.cakeLight.updateColor(value);
        });

        cakeLightFolder.open();
    }
}

export { MyGuiInterface };
