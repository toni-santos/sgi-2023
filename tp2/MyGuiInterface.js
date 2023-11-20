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
            color: new THREE.Color(1, 1, 1)
        };
    }

    /**
     * Set the contents object
     * @param {MyContents} contents the contents objects 
     */
    setContents(contents) {
        this.contents = contents
    }

    /**
     * Initialize the gui interface
     */
    init() {
        const cameraFolder = this.datgui.addFolder("Camera");
        cameraFolder
            .add(this.app, "activeCameraName", [
                "cam1",
                "cam2"
            ])
            .name("active camera");
        cameraFolder.open();
        this.datgui.add(this.app, "wireframe").name("wireframe").onChange((value) => {
            this.app.wireframes.forEach((wireframe) => {
                wireframe.wireframe = value;
            });
        });

        const colorFolder = this.datgui.addFolder("Colors");
        colorFolder.addColor(this.defaultConf, "color").name("Scanner Lens").onChange(() => {
            this.contents.changeLensColor(this.defaultConf.color);
        });
        colorFolder.addColor(this.defaultConf, "color").name("Trash Can").onChange(() => {
            this.contents.changeTrashColor(this.defaultConf.color);
        });
        colorFolder.open();
    }
}

export { MyGuiInterface };