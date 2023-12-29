import * as THREE from "three";
import { MyText } from "./MyText.js";
import { MyShaderBillboard } from "./MyShaderBillboard.js";

class MainMenu {

    constructor(app, layer) {
        this.app = app;
        this.objects = [];

        this.startButton = new MyText(this.app, "Start", layer, new THREE.Vector3(0, 0, -2));
        this.optionsButton = new MyText(this.app, "Options", layer, new THREE.Vector3(0, 0, 2));
        // TODO: remove this as it is a testing placeholder
        this.shaderBillboard = new MyShaderBillboard(this.app, "scenes/feupzero/textures/okcomp_map.jpg", "scenes/feupzero/textures/okcomp.jpg", "shaders/s1.vert", "shaders/s1.frag");

        this.startButton.layers.set(layer);
        this.optionsButton.layers.set(layer);
        this.objects.push(this.startButton, this.optionsButton, this.shaderBillboard);

        this.app.setActiveCamera("Menu");
    }
}

export { MainMenu };