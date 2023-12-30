import * as THREE from "three";
import { MyText } from "./MyText.js";

class PausedScreen {

    constructor(app, layer) {
        this.app = app;
        this.objects = [];

        this.continueButton = new MyText(this.app, "Continue", layer, new THREE.Vector3(0, 0, -2));
        this.exitButton = new MyText(this.app, "Exit", layer, new THREE.Vector3(0, 0, 2));

        this.continueButton.layers.set(layer);
        this.exitButton.layers.set(layer);
        this.objects.push(this.continueButton, this.exitButton);
    }

}

export { PausedScreen };