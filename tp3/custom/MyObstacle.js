import * as THREE from "three";
import { MyCollidingObject } from "./MyCollidingObject.js";

class MyObstacle extends MyCollidingObject {
    constructor(app) {
        super(0xff0000);
        this.app = app;
        this.type = 'Group';
    }
}

export {MyObstacle};