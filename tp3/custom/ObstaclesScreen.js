import * as THREE from "three";
import { MyText } from "./MyText.js";
import { MyTreeTrunk } from "./MyTreeTrunk.js";

class ObstaclesScreen {

    constructor(app, layer) {
        this.app = app;
        this.objects = [];
        this.obstacles = [];

        this.section = new MyText(this.app, "Pick an obstacle", layer, new THREE.Vector3(0, 0, -2));
        this.confirmButton = new MyText(this.app, "Confirm", layer, new THREE.Vector3(0, 0, 2));

        this.trunk = new MyTreeTrunk(this.app);
        this.trunk.mesh.name = "Trunk";
        this.trunk.position.set(0, 0, 0);

        this.confirmButton.layers.set(layer);
        this.trunk.mesh.layers.set(layer);

        this.obstacles["Trunk"] = this.trunk;

        this.objects.push(this.section, this.confirmButton, this.trunk);
    }

}

export { ObstaclesScreen };