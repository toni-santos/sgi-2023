import * as THREE from "three";
import { MyCollidingObject } from "./MyCollidingObject.js";
import { sinWave } from "../helper/MyAnimations.js";

class MyVehicle extends MyCollidingObject {
    constructor(app, maxSpeed=30, acceleration=1.9, handling=0.7) {
        super(app, 0xff00ff);
        this.maxSpeed = maxSpeed;
        this.acceleration = acceleration;
        this.handling = handling;
        this.app = app;
        this.type = 'Group';
        this.velocity = 0;
        this.angle = 0;
        this.orientation = new THREE.Vector3(0, 0, 1);
        this.material = new THREE.MeshBasicMaterial({color: 0xff00ff});
        this.mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 0.5, 2), this.material);
        this.mesh.position.z += 0.5;
        this.collisionMesh = this.addCollisionMesh(this.mesh);
        this.mesh.geometry.computeBoundingBox();
        this.add(this.mesh);
        this.add(this.collisionMesh);
        console.log(this.mesh.geometry.boundingBox);
    }

    update(t) {
		this.idleAnimation(t);
        this.getWorldDirection(this.orientation);
        this.changePosition();
        console.log(this.velocity * 100);
        return this.velocity = Math.abs(this.velocity) <= 0.0001 ? 0 : 
                                this.velocity < 0 ? this.velocity + 0.0001 :
                                this.velocity - 0.0001
	}

    changePosition() {
        this.position.x += 1 * this.velocity * Math.sin(this.angle);
        this.position.z += 1 * this.velocity * Math.cos(this.angle);
    }

    changeVelocity(inc) {
        return this.velocity = Math.min(Math.max(-0.04, this.velocity + inc * this.acceleration), this.maxSpeed/100);
    }

    turn(angle) {
        this.angle += angle * this.handling;
        return this.rotateY(angle * this.handling);
    }

    idleAnimation(t) {
        return this.translateY(sinWave(t, 0.01, 2));
	}

    setRotation(angle) {
        this.angle = angle;
        return this.rotateY(angle);
    }
}

export {MyVehicle};