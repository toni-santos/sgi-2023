import * as THREE from "three";
import { MyText } from "./MyText.js";

class PausedScreen {

    constructor(app, layer) {
        this.app = app;
        this.objects = [];

        this.continueButton = new MyText(this.app, "Continue", layer, new THREE.Vector3(0, 0, -2));
        this.restartButton = new MyText(this.app, "Restart", layer, new THREE.Vector3(0, 0, 0));
        this.exitButton = new MyText(this.app, "Exit", layer, new THREE.Vector3(0, 0, 2));

        this.continueButton.layers.set(layer);
        this.exitButton.layers.set(layer);
        this.restartButton.layers.set(layer);
        this.objects.push(this.continueButton, this.exitButton, this.restartButton);
    }

}

export { PausedScreen };