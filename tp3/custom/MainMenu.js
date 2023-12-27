import * as THREE from "three";
import { MyText } from "./MyText.js";

class MainMenu {

    constructor(app, layer) {
        this.app = app;
        this.objects = [];

        this.startButton = new MyText(this.app, "Start", layer, new THREE.Vector3(0, 0, -2));
        this.optionsButton = new MyText(this.app, "Options", layer, new THREE.Vector3(0, 0, 2));

        this.app.scene.add(this.startButton);
        this.app.scene.add(this.optionsButton);

        this.startButton.layers.set(layer);
        this.optionsButton.layers.set(layer);
        this.objects.push(this.startButton, this.optionsButton);

        this.app.setActiveCamera("Menu");
    }
}

export { MainMenu };