import * as THREE from "three";
import { MyCollidingObject } from "./MyCollidingObject.js";

class MyVehicle extends MyCollidingObject {
    constructor(app) {
        super(0xff00ff);
        this.app = app;
        this.type = 'Group';
    }
}

export {MyVehicle};