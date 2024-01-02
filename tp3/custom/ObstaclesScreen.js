import * as THREE from "three";
import { MyText } from "./MyText.js";
import { MyTreeTrunk } from "./MyTreeTrunk.js";
import { MyModifier } from "./MyModifier.js";

class ObstaclesScreen {

    constructor(app, layer) {
        this.app = app;
        this.objects = [];
        this.obstacles = [];

        this.section = new MyText(this.app, "Pick an obstacle", 0, new THREE.Vector3(0, 0, -2));
        this.confirmButton = new MyText(this.app, "Confirm", layer, new THREE.Vector3(0, 0, 2));

        this.limitSpeed = new MyModifier(this.app, 2, new THREE.Vector3(0, 0, 0), 3, false);
        this.spin = new MyModifier(this.app, 3, new THREE.Vector3(0, 0, 0), 3, false);

        this.limitSpeed.moveObject(new THREE.Vector3(-2, 0, 0));
        this.spin.moveObject(new THREE.Vector3(2, 0, 0));

        this.confirmButton.layers.set(layer);
        this.limitSpeed.mesh.layers.set(layer);
        this.spin.mesh.layers.set(layer);

        this.limitSpeed.mesh.name = this.limitSpeed.name;
        this.spin.mesh.name = this.spin.name;

        this.obstacles[this.limitSpeed.name] = this.limitSpeed;
        this.obstacles[this.spin.name] = this.spin;

        this.previous = null;
        this.selected = this.limitSpeed;

        this.objects.push(this.section, this.confirmButton, this.limitSpeed, this.spin);
    }

}

export { ObstaclesScreen };