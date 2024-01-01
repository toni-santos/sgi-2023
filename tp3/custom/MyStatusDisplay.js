import * as THREE from "three";
import { MyText } from "./MyText.js";

class MyStatusDisplay extends THREE.Object3D {
    constructor(app, lap, time, velocity, powerup) {
        super();
        this.app = app;
        this.objects = [];
        this.type = "Group";

        this.background = new THREE.Mesh(new THREE.BoxGeometry(5.6, 3.5, 0.1), new THREE.MeshBasicMaterial({ color: 0x000000 }));
        this.background.position.set(0, 1.75, -0.1);


        this.powerup = new MyText(this.app, "Powerup", -1, new THREE.Vector3(7*0.4, 2.5, 0), 0.4);
        this.velocity = new MyText(this.app, "Speed", -1, new THREE.Vector3(5*0.4, 2, 0), 0.4);
        this.time = new MyText(this.app, "Time", -1, new THREE.Vector3(4*0.4, 1.5, 0), 0.4);
        this.lap = new MyText(this.app, "Lap", -1, new THREE.Vector3(3*0.4, 1, 0), 0.4);

        this.powerupText = new MyText(this.app, powerup, -1, new THREE.Vector3(-0.4, 2.5, 0), 0.4);
        this.velocityText = new MyText(this.app, velocity, -1, new THREE.Vector3(-0.4, 2, 0), 0.4);
        this.timeText = new MyText(this.app, time, -1, new THREE.Vector3(-0.4, 1.5, 0), 0.4);
        this.lapText = new MyText(this.app, lap, -1, new THREE.Vector3(-0.8, 1, 0), 0.4);

        this.powerup.rotateX(Math.PI / 2);
        this.velocity.rotateX(Math.PI / 2);
        this.time.rotateX(Math.PI / 2);
        this.lap.rotateX(Math.PI / 2);

        this.lapText.rotateX(Math.PI / 2);
        this.timeText.rotateX(Math.PI / 2);
        this.velocityText.rotateX(Math.PI / 2);
        this.powerupText.rotateX(Math.PI / 2);

        this.add(this.background);
        this.add(this.powerup);
        this.add(this.velocity);
        this.add(this.time);
        this.add(this.lap);
        this.add(this.lapText);
        this.add(this.timeText);
        this.add(this.velocityText);
        this.add(this.powerupText);
    }

    update(lap, time, velocity, powerup) {
        this.objects = [];

        this.lapText.setText(lap);
        this.timeText.setText(time);
        this.velocityText.setText(velocity);
        if (powerup)
            this.powerupText.setText(powerup);

    }
}

export { MyStatusDisplay };