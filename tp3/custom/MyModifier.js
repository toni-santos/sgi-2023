import * as THREE from "three";
import { MyCollidingObject } from "./MyCollidingObject.js";

class MyModifier extends MyCollidingObject {
    constructor(app, effect, position, duration, isPositive) {
        super(0xff0000);
        this.app = app;
        this.type = 'Group';
        this.duration = duration;
        this.positive = isPositive;
        this.color = this.positive ? 0x00aa00 : 0xaa0000;
        this.modifyingSince = new THREE.Clock();
        this.name = typeof effect === 'number' ? NAMES[effect] : effect;
        this.modifierFunc = EFFECTS[this.name]["function"];
        this.material = new THREE.MeshBasicMaterial({color: this.color});
        this.mesh = new THREE.Mesh(EFFECTS[this.name]["model"], this.material);
        this.mesh.position.set(position.x, 0.35, position.z);
        console.log(this.position);
        this.setBoundingBox(this.mesh);
        this.addCollisionMesh(this.mesh);
        this.add(this.mesh);
        this.add(this.collisionMesh);
    }

    apply(obj) {
        obj.loadDefaults();
        obj.modifier = this;
        this.modifyingSince.start();
    }

    static increaseSpeed(obj) {
        return obj.velocity = obj.defaultMaxSpeed;
    }

    static increaseAcceleration(obj) {
        return obj.acceleration = obj.defaultAcceleration * 3;
    }

    static increaseHandling(obj) {
        return obj.handling = obj.defaultHandling * 3;
    }

    static limitSpeed(obj) {
        return obj.velocity = Math.min(obj.velocity, obj.maxSpeed/7);
    }

    static spin(obj) {
        MyModifier.limitSpeed(obj);
        return obj.turn((Math.PI/20 - this.modifyingSince.getElapsedTime() / (10 * this.duration))/obj.defaultHandling, true);
    }
}

const EFFECTS = {};
const NAMES = ["Super Turning", "Max Acceleration", "Speed Limit", "Spin"];
const GEOMETRIES = [new THREE.SphereGeometry(0.25), new THREE.BoxGeometry(0.5, 0.5, 0.5)];

EFFECTS[NAMES[0]] = {
    "function": MyModifier.increaseHandling,
    "model": GEOMETRIES[0]
};
EFFECTS[NAMES[1]] = {
    "function": MyModifier.increaseAcceleration,
    "model": GEOMETRIES[1]
};
EFFECTS[NAMES[2]] = {
    "function": MyModifier.limitSpeed,
    "model": GEOMETRIES[0]
};
EFFECTS[NAMES[3]] = {
    "function": MyModifier.spin,
    "model": GEOMETRIES[1]
};

export { MyModifier }