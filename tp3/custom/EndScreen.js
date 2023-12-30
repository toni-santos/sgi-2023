import * as THREE from "three";
import { MyText } from "./MyText.js";

class EndScreen {
    constructor(app, layer, name = "Player", time = "60", difficulty = "Easy") {
        this.app = app;
        this.objects = [];
        
        // TODO: add difficulty, winner, loser, etc.
        this.endText = new MyText(this.app, "Finish!", layer, new THREE.Vector3(0, 0, -2));
        this.endText.layers.set(layer);
        this.returnButton = new MyText(this.app, "Return", layer, new THREE.Vector3(-4, 0, 4));
        this.returnButton.layers.set(layer);
        this.restartButton = new MyText(this.app, "Restart", layer, new THREE.Vector3(4, 0, 4));
        this.restartButton.layers.set(layer);

        this.playerName = new MyText(this.app, name, layer, new THREE.Vector3(-5, 0, 2));
        this.playerTime = new MyText(this.app, this.prettifyTime(time), layer, new THREE.Vector3(5, 0, 2));
        this.levelDifficulty = new MyText(this.app, difficulty, layer, new THREE.Vector3(0, 0, 2)); 

        // TODO: add particle system fireworks

        this.objects.push(this.endText, this.returnButton, this.restartButton, this.playerName, this.playerTime);
    }

    updateResult(name, time) {
        this.objects = [];
        this.playerName.setText(name);
        this.playerTime.setText(this.prettifyTime(time));
        this.objects.push(this.playerName, this.playerTime);
    }

    prettifyTime(time) {
        let minutes = Math.floor(time / 60);
        let seconds = Math.floor(time % 60);
        let miliseconds = Math.floor((time % 1) * 100);
        if (seconds < 10)
            seconds = "0" + seconds;

        return `${minutes}:${seconds}:${miliseconds}`;
    }
}

export { EndScreen };