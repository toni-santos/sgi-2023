import * as THREE from "three";
import { MyCollidingObject } from "./MyCollidingObject.js";
import { sinWave } from "../helper/MyAnimations.js";
import { posMod } from "../helper/MyUtils.js";

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
        this.closestPointIndex = 0;
        this.outOfBounds = false;
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
        //console.log(this.velocity * 100);
        return this.velocity = Math.abs(this.velocity) <= 0.0001 ? 0 : 
                                this.velocity < 0 ? this.velocity + 0.0001 :
                                this.velocity - 0.0001
	}

    changePosition() {
        this.position.x += 1 * this.velocity * Math.sin(this.angle);
        this.position.z += 1 * this.velocity * Math.cos(this.angle);
    }

    changeVelocity(inc) {
        return this.velocity = Math.min(Math.max(-0.04, this.velocity + inc * this.acceleration), this.outOfBounds ? this.maxSpeed/700 : this.maxSpeed/100);
    }

    turn(angle) {
        this.angle += angle * this.handling;
        return this.rotateY(angle * this.handling);
    }

    idleAnimation(t) {
        return this.translateY(sinWave(t, 0.01, 2));
	}

    isOutOfBounds(trackPoints) {
        console.log(this.distanceToPoint(this.closestPointIndex, trackPoints))
        return this.outOfBounds = this.distanceToPoint(this.closestPointIndex, trackPoints) > 4
    }

    computeClosestPoint(trackPoints) {
        if (this.distanceToPoint(this.closestPointIndex - 1, trackPoints) <= this.distanceToPoint(this.closestPointIndex, trackPoints)) {
            this.closestPointIndex = posMod(this.closestPointIndex - 1, trackPoints.length - 1);
        }
        else if (this.distanceToPoint(this.closestPointIndex + 1, trackPoints) <= this.distanceToPoint(this.closestPointIndex, trackPoints)) {
            this.closestPointIndex = posMod(this.closestPointIndex + 1, trackPoints.length - 1);
        }
        //TODO: fazer uma função q devolve a expressão de baixo com o indice como argumento
        //console.log(this.position.distanceTo(new THREE.Vector3(trackPoints[posMod(this.closestPointIndex + 1, trackPoints.length)].x, this.position.y, trackPoints[posMod(this.closestPointIndex + 1, trackPoints.length)].z)), this.position.distanceTo(new THREE.Vector3(trackPoints[this.closestPointIndex].x, this.position.y, trackPoints[this.closestPointIndex].z)));
        return this.closestPointIndex
    }

    distanceToPoint(idx, trackPoints) {
        return this.position.distanceTo(new THREE.Vector3(trackPoints[posMod(idx, trackPoints.length - 1)].x, this.position.y, trackPoints[posMod(idx, trackPoints.length - 1)].z))
    }

    setRotation(angle) {
        this.angle = angle;
        return this.rotateY(angle);
    }
}

export {MyVehicle};