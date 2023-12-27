import * as THREE from "three";
import { MyCollidingObject } from "./MyCollidingObject.js";

class MyModifier extends MyCollidingObject {
    constructor(app, effect, position, color, duration) {
        super(0xff0000);
        this.app = app;
        this.type = 'Group';
        this.duration = duration;
        this.modifyingSince = new THREE.Clock();
        this.geometries = [new THREE.SphereGeometry(0.25), new THREE.BoxGeometry(0.5, 0.5, 0.5)]
        this.positiveEffects = [this.increaseHandling, this.increaseAcceleration];
        this.negativeEffects = [this.limitSpeed, this.spin];
        this.material = new THREE.MeshBasicMaterial({color: color});
        this.mesh = new THREE.Mesh(this.geometries[effect], this.material);
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

    increaseSpeed(obj) {
        return obj.velocity = obj.defaultMaxSpeed;
    }

    increaseAcceleration(obj) {
        return obj.acceleration = obj.defaultAcceleration * 3;
    }

    increaseHandling(obj) {
        return obj.handling = obj.defaultHandling * 3;
    }

    limitSpeed(obj) {
        return obj.velocity = Math.min(obj.velocity, obj.maxSpeed/7);
    }

    spin(obj) {
        this.limitSpeed(obj);
        return obj.turn((Math.PI/20 - this.modifyingSince.getElapsedTime() / (10 * this.duration))/obj.defaultHandling, true);
    }
}

export { MyModifier }