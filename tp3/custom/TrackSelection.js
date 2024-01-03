import * as THREE from "three";
import { MyText } from "./MyText.js";

class TrackSelection {
    constructor(app, layer) {
        this.app = app;
        this.layer = layer;
        this.tracks = [];
        this.objects = [];
        this.selected = "SMP";
        this.previous = null;

        this.section = new MyText(app, "Track Selection", 0, new THREE.Vector3(0, 0, -2));
        this.smp = new MyText(app, "SMP", this.layer, new THREE.Vector3(-4, 0, 0));
        this.adv = new MyText(app, "ADV", this.layer, new THREE.Vector3(4, 0, 0));
        this.confirm = new MyText(app, "Confirm", this.layer, new THREE.Vector3(4, 0, 4));
        this.back = new MyText(app, "Back", this.layer, new THREE.Vector3(-4, 0, 4));

        this.tracks["SMP"] = this.smp;
        this.tracks["ADV"] = this.adv;

        this.objects.push(this.smp, this.adv, this.confirm, this.section, this.back);
    }
}

export { TrackSelection };