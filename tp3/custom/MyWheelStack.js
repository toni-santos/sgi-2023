import * as THREE from "three";
import { MyWheel } from "./MyWheel.js";

class MyWheelStack extends THREE.Object3D {
    constructor(app, totalWheels = 10, maxHeight = 4) {
        super();
        this.app = app;
        let shift = -1;
        
        for (let i = 0; i < totalWheels; i++) {
            if (i % maxHeight == 0) shift++;
            const wheel = new MyWheel(this.app);
            wheel.position.set(0, wheel.wheelTube * (i % maxHeight * 2 + 1), shift * (wheel.wheelRadius * 2 + wheel.wheelTube * 2 + 0.02)); 
            this.add(wheel);
        }
    }
}

export { MyWheelStack };