import * as THREE from "three";
import { MyVehicle } from "./MyVehicle.js";
import { MyText } from "./MyText.js";
import { MyWheelStack } from "./MyWheelStack.js";
import { MyLampPost } from "./MyLampPost.js";

class CarSelection {

    constructor(app, layer, cars) {
        this.app = app;
        this.cars = cars;
        this.objects = [];
        this.map = [];
        this.layer = layer;

        this.playerCar1 = new MyVehicle(this.app, this.cars[0], true);
        this.playerCar2 = new MyVehicle(this.app, this.cars[1], true);
        this.playerCar3 = new MyVehicle(this.app, this.cars[2], true);
        this.opposingCar1 = new MyVehicle(this.app, this.cars[0], true);
        this.opposingCar2 = new MyVehicle(this.app, this.cars[1], true);
        this.opposingCar3 = new MyVehicle(this.app, this.cars[2], true);
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

        // Props        
        this.wheelStack = new MyWheelStack(this.app, 30, 5);
        this.wheelStack.position.set(0, 0, -1);
        // ShadowMaterial is a bit wonky but it's the best we can get while keeping the aesthetic
        this.floor = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), new THREE.ShadowMaterial({ opacity: 0.05 }));
        this.floor.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
        this.floor.position.set(0, -0.02, 0);
        this.floor.receiveShadow = true;
        this.lamp1 = new MyLampPost(this.app, this.floor, -Math.PI/2);
        this.lamp2 = new MyLampPost(this.app, this.floor, -Math.PI/2);
        this.lamp1.translateX(-4);
        this.lamp1.translateZ(-3);
        this.lamp2.translateX(4);
        this.lamp2.translateZ(-3);
        this.objects.push(this.wheelStack, this.lamp1, this.lamp2, this.floor);
    }

}

export { CarSelection };