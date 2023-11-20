import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { MyApp } from './MyApp.js';
import { MyContents } from './MyContents.js';
import * as THREE from 'three';

/**
    This class customizes the gui interface for the app
*/
class MyGuiInterface  {

    /**
     * 
     * @param {MyApp} app The application object 
     */
    constructor(app) {
        this.app = app
        this.datgui =  new GUI();
        this.contents = null;
        this.defaultConf = {
            color: new THREE.Color(1, 0, 0)
        };
    }

    /**
     * Set the contents object
     * @param {MyContents} contents the contents objects 
     */
    setContents(contents) {
        this.contents = contents
        this.trashMaterial = this.contents.meshes["bucket"][0].children[0].material
        this.tableTopMaterial = this.contents.meshes["tableTop"][0].children[0].material
        this.mainLight = this.contents.meshes["floor"][0].children[1];
    }

    /**
     * Initialize the gui interface
     */
    init() {
        const cameraFolder = this.datgui.addFolder("Camera");
        cameraFolder
            .add(this.app, "activeCameraName", Object.keys(this.contents.cameras))
            .name("active camera");
        cameraFolder.open();

        const colorFolder = this.datgui.addFolder("Colors");
        colorFolder.addColor(this.defaultConf, "color").name("Scanner Lens").onChange(() => {
            this.contents.changeColor(this.defaultConf.color, "scannerLens", true);
        });
        colorFolder.addColor(this.trashMaterial, "color").name("Trash Can").onChange((value) => {
            this.contents.changeColor(value, "bucket", false);
        });
        colorFolder.addColor(this.tableTopMaterial, "color").name("Table Top").onChange((value) => {
            this.contents.changeColor(value, "tableTop", false);
        });
        colorFolder.open();

        const lightFolder = this.datgui.addFolder("Lights");
        lightFolder.add(this.mainLight, "intensity", 0, 100).name("Main Light Intensity")

        const othersFolder = this.datgui.addFolder("Others");
        othersFolder.add(this.app, "wireframe").name("wireframe").onChange((value) => {
            this.app.wireframes.forEach((wireframe) => {
                wireframe.wireframe = value;
            });
        });
        othersFolder.open();

    }
}

export { MyGuiInterface };