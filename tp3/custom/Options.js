import * as THREE from "three";
import { MyText } from "./MyText.js";

class Options {
    constructor(app, layer, playerName) {
        this.app = app;
        this.objects = [];
        this.difficulties = [];
        this.playerName = playerName;

        this.selected = "Normal";
        this.previous = null;

        this.section = new MyText(this.app, "Options", layer, new THREE.Vector3(0, 0, -4));
        this.diff1 = new MyText(this.app, "Easy", layer, new THREE.Vector3(-4.75, 0, -2), 0.75);
        this.diff2 = new MyText(this.app, "Normal", layer, new THREE.Vector3(0.75, 0, -2), 0.75);
        this.diff3 = new MyText(this.app, "Hard", layer, new THREE.Vector3(5.75, 0, -2), 0.75);

        this.difficulties["Easy"] = this.diff1;
        this.difficulties["Normal"] = this.diff2;
        this.difficulties["Hard"] = this.diff3;

        this.back = new MyText(this.app, "Back", layer, new THREE.Vector3(0, 0, 4));
        
        this.name = new MyText(this.app, this.playerName, layer, new THREE.Vector3(0, 0, 0));

        this.diff1.layers.set(layer);
        this.diff2.layers.set(layer);
        this.diff3.layers.set(layer);
        this.name.layers.set(layer);
        this.back.layers.set(layer);

        this.objects.push(this.section, this.diff1, this.diff2, this.diff3, this.back, this.name);
    }

    handleNameInput(e) {
        this.objects = [];
        
        switch (e.inputType) {
            case 'insertText':
                this.playerName += e.data;
                break;
            case 'deleteContentBackward':
                this.playerName = this.playerName.slice(0, -1);
                break;
            case 'deleteWordBackward':
                const words = this.playerName.split(" ");
                words.pop();
                this.playerName = words.join(" ");
                break;
        }
        this.name.setText(this.playerName);

        this.objects.push(this.name);
    }
}

export { Options };