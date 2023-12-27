import * as THREE from "three";
import { MyVehicle } from "./MyVehicle.js";
import { MyText } from "./MyText.js";

class CarSelection {

    constructor(app, layer, cars) {
        this.app = app;
        this.cars = cars;
        this.objects = [];
        this.map = [];
        this.layer = layer;

        this.playerCar1 = new MyVehicle(this.app, this.cars[0]);
        this.playerCar2 = new MyVehicle(this.app, this.cars[1]);
        this.playerCar3 = new MyVehicle(this.app, this.cars[2]);
        this.opposingCar1 = new MyVehicle(this.app, this.cars[0]);
        this.opposingCar2 = new MyVehicle(this.app, this.cars[1]);
        this.opposingCar3 = new MyVehicle(this.app, this.cars[2]);
        this.backButton = new MyText(this.app, "Back", layer, new THREE.Vector3(-4, 0, 4));
        this.confirmButton = new MyText(this.app, "Confirm", layer, new THREE.Vector3(4, 0, 4));

        this.playerCar1.loadModel(this.layer);
        this.playerCar2.loadModel(this.layer);
        this.playerCar3.loadModel(this.layer);
        this.opposingCar1.loadModel(this.layer);
        this.opposingCar2.loadModel(this.layer);
        this.opposingCar3.loadModel(this.layer);

        this.playerCar1.position.set(-2,0,0);
        this.playerCar2.position.set(-4,0,0);
        this.playerCar3.position.set(-6,0,0);
        this.opposingCar1.position.set(2,0,0);
        this.opposingCar2.position.set(4,0,0);
        this.opposingCar3.position.set(6,0,0);

        this.playerCar1.name = "player_" + this.cars[0];
        this.playerCar2.name = "player_" + this.cars[1];
        this.playerCar3.name = "player_" + this.cars[2];
        this.opposingCar1.name = "cpu_" + this.cars[0]; 
        this.opposingCar2.name = "cpu_" + this.cars[1]; 
        this.opposingCar3.name = "cpu_" + this.cars[2]; 

        this.objects.push(this.playerCar1, this.playerCar2, this.playerCar3, this.opposingCar1, this.opposingCar2, this.opposingCar3, this.backButton, this.confirmButton);

        this.map[this.playerCar1.name] = this.playerCar1;
        this.map[this.playerCar2.name] = this.playerCar2;
        this.map[this.playerCar3.name] = this.playerCar3;
        this.map[this.opposingCar1.name] = this.opposingCar1;
        this.map[this.opposingCar2.name] = this.opposingCar2;
        this.map[this.opposingCar3.name] = this.opposingCar3;

        this.backButton.layers.set(layer);
        this.confirmButton.layers.set(layer);
    }

}

export { CarSelection };