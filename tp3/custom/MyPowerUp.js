import * as THREE from "three";
import { MyCollidingObject } from "./MyCollidingObject.js";

class MyPowerUp extends MyCollidingObject {
    constructor(app) {
        super(0x00ff00);
        this.app = app;
        this.type = 'Group';
    }
}

export {MyPowerUp};