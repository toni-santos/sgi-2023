import * as THREE from "three";
import { MyCollidingObject } from "./MyCollidingObject.js";
import { MyModifier } from "./MyModifier.js";

class MyPowerUp extends MyModifier {
    constructor(app, effect, position, duration=1) {
        super(app, effect, position, 0x00aa00, duration);
        this.app = app;
        this.type = 'Group';
        this.modifierFunc = this.positiveEffects[effect];
    }
}

export {MyPowerUp};