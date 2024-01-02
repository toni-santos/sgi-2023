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

        this.student1Name = new MyText(this.app, "Antonio Santos", 0, new THREE.Vector3(-2, 0, 4));
        this.student2Name = new MyText(this.app, "Pedro Silva", 0, new THREE.Vector3(7, 0, 4));
        this.student1Number = new MyText(this.app, "up202008004", 0, new THREE.Vector3(-2.5, 0, 4.7));
        this.student2Number = new MyText(this.app, "up202004985", 0, new THREE.Vector3(7, 0, 4.7));

        this.student1Name.scale.set(0.5, 0.5, 0.5);
        this.student2Name.scale.set(0.5, 0.5, 0.5);
        this.student1Number.scale.set(0.5, 0.5, 0.5);
        this.student2Number.scale.set(0.5, 0.5, 0.5);

        this.startButton.layers.set(layer);
        this.optionsButton.layers.set(layer);

        this.objects.push(this.startButton, this.optionsButton, this.logo, this.feup, this.student1Name, this.student2Name, this.student1Number, this.student2Number);
    }
}

export { MainMenu };