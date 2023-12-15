import * as THREE from "three";
import { MyCollidingObject } from "./MyCollidingObject.js";
import { MyModifier } from "./MyModifier.js";

class MyObstacle extends MyModifier {
    constructor(app, effect, position, duration=1) {
        super(app, effect, position, 0xaa0000, duration);
        this.app = app;
        this.type = 'Group';
        this.modifierFunc = this.negativeEffects[effect];
    }
}

export {MyObstacle};