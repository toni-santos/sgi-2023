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
        // add a folder to the gui interface for the box
        const boxFolder = this.datgui.addFolder("Box");
        // note that we are using a property from the contents object
        boxFolder
            .add(this.contents, "boxMeshSize", 0, 10)
            .name("size")
            .onChange(() => {
                this.contents.rebuildBox();
            });
        boxFolder.add(this.contents, "boxEnabled", true).name("enabled");
        boxFolder.add(this.contents.boxDisplacement, "x", -5, 5);
        boxFolder.add(this.contents.boxDisplacement, "y", -5, 5);
        boxFolder.add(this.contents.boxDisplacement, "z", -5, 5);
        boxFolder.open();

        const data = {
            "diffuse color": this.contents.diffusePlaneColor,
            "specular color": this.contents.specularPlaneColor
        };

        // adds a folder to the gui interface for the plane
        const planeFolder = this.datgui.addFolder("Plane");
        planeFolder.addColor(data, "diffuse color").onChange((value) => {
            this.contents.updateDiffusePlaneColor(value);
        });
        planeFolder.addColor(data, "specular color").onChange((value) => {
            this.contents.updateSpecularPlaneColor(value);
        });
        planeFolder
            .add(this.contents, "planeShininess", 0, 1000)
            .name("shininess")
            .onChange((value) => {
                this.contents.updatePlaneShininess(value);
            });
        planeFolder.open();

        // adds a folder to the gui interface for the camera
        const cameraFolder = this.datgui.addFolder("Camera");
        cameraFolder
            .add(this.app, "activeCameraName", [
                "Perspective",
                "New Perspective",
                "Left",
                "Right",
                "Top",
                "Bottom",
                "Front",
                "Back"
            ])
            .name("active camera");
        // note that we are using a property from the app
        cameraFolder
            .add(this.app.activeCamera.position, "x", 0, 10)
            .name("x coord");
        cameraFolder.open();

        const lightFolder = this.datgui.addFolder("Point Light");
        lightFolder.add(this.contents.pointLight, "visible", true).name("enable");
        lightFolder.open()

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
