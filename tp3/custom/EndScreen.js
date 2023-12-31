import * as THREE from "three";
import { MyText } from "./MyText.js";
import { MyVehicle } from "./MyVehicle.js";

class EndScreen {
    constructor(app, layer, name = "Player", time = "60", difficulty = "Easy") {
        this.app = app;
        this.layer = layer;
        this.objects = [];
        this.fireworks = [];
        
        this.returnButton = new MyText(this.app, "Return", layer, new THREE.Vector3(-4, 0, 4));
        this.returnButton.layers.set(layer);
        this.restartButton = new MyText(this.app, "Restart", layer, new THREE.Vector3(4, 0, 4));
        this.restartButton.layers.set(layer);

        this.endText = new MyText(this.app, "Finish!", layer, new THREE.Vector3(0, 0, -2));
        this.levelDifficulty = new MyText(this.app, difficulty, layer, new THREE.Vector3(0.125, 0, -1), 0.75); 

        this.playerName = new MyText(this.app, name, layer, new THREE.Vector3(-4, 0, 2));
        this.playerTime = new MyText(this.app, this.prettifyTime(time), layer, new THREE.Vector3(4, 0, 2));

        this.objects.push(this.endText, this.returnButton, this.restartButton, this.playerName, this.playerTime, this.levelDifficulty);
    }

    updateResult(name, time, player, cpu, difficulty, winner) {
        this.objects = [];

        this.playerName.setText(name);
        this.playerTime.setText(this.prettifyTime(time));
        this.levelDifficulty.setText(difficulty);

        this.playerCar = new MyVehicle(this.app, player, true);
        this.cpuCar = new MyVehicle(this.app, cpu, true);
        this.playerCar.position.set(-4, 0, 0);
        this.cpuCar.position.set(4, 0, 0);
        this.playerCar.loadModel(this.layer);
        this.cpuCar.loadModel(this.layer);

        this.objects.push(this.playerName, this.playerTime, this.playerCar, this.cpuCar, this.levelDifficulty);
    }

    // TODO: check if this is correctly done
    reset() {
        this.app.scene.remove(this.playerCar, this.cpuCar);
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