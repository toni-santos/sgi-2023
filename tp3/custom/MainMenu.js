import * as THREE from "three";
import { MyText } from "./MyText.js";

class MainMenu {
    constructor(app, layer) {
        this.app = app;
        this.objects = [];

        this.logo = new THREE.Mesh(
            new THREE.PlaneGeometry(5, 2.5),
            new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("scenes/feupzero/textures/logo.png"), transparent: true })
        );
        this.logo.rotateX(-Math.PI / 2);
        this.logo.position.set(0, 0, -2);

        this.feup = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 1),
            new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("scenes/feupzero/textures/feup-logo.png"), transparent: true })
        );
        this.feup.rotateX(-Math.PI / 2);
        this.feup.position.set(0, 0, 4);

        this.startButton = new MyText(this.app, "Start", layer, new THREE.Vector3(0, 0, 0));
        this.optionsButton = new MyText(this.app, "Options", layer, new THREE.Vector3(0, 0, 2));
        this.startButton.layers.set(layer);
        this.optionsButton.layers.set(layer);
        this.objects.push(this.startButton, this.optionsButton, this.logo, this.feup);
    }
}

export { MainMenu };