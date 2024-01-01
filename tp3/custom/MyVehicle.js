import * as THREE from "three";
import { MyCollidingObject } from "./MyCollidingObject.js";
import { sinWave } from "../helper/MyAnimations.js";
import { posMod, signedAngleTo } from "../helper/MyUtils.js";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class MyVehicle extends MyCollidingObject {
    constructor(app, model, shadow = false, maxSpeed=30, acceleration=1.9, handling=1.5, owner="Player") {
        super(app, 0xff00ff);
        this.maxSpeed = maxSpeed / 100;
        this.acceleration = acceleration;
        this.handling = handling;
        this.owner = owner;
        this.saveDefaults();
        this.app = app;
        this.type = 'Group';
        this.velocity = 0;
        this.angle = 0;
        this.wheelAngle = 0;
        this.orientation = new THREE.Vector3(0, 0, 1);
        this.closestPointIndex = 0;
        this.visitedPoints = [0];
        this.completedLaps = 0;
        this.finished = false;
        this.outOfBounds = false;
        this.modifier = null;
        this.material = new THREE.MeshBasicMaterial({color: 0xff00ff});
        // this.mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 0.5, 2), this.material);
        // this.mesh.position.z += 0.5;
        // this.setBoundingBox(this.mesh);
        // this.addCollisionMesh(this.mesh);
        // this.add(this.mesh);
        // this.add(this.collisionMesh);
        // console.log(this.boundingBox);
        this.name = model;
        this.castShadow = shadow;
    }

    async loadModel(layer) {
        this.layer = layer;
        const loader = new GLTFLoader();
        return await loader.loadAsync(`scenes/feupzero/models/${this.name}/scene.gltf`).then((gltf) => this.loadHelper(this, gltf));
    }

    loadHelper(self, gltf) {
        self.mesh = gltf.scene;
        self.mesh.traverse((child) => {
            if (child.isMesh) {
                child.layers.set(self.layer);
                child.castShadow = self.castShadow;
                child.name = self.name;
            }
        });
        // self.mesh.scale.set(0.01, 0.01, 0.01);
        self.mesh.rotateY(Math.PI/2);
        self.setBoundingBox(self.mesh);
        self.addCollisionMesh(self.mesh);
        this.mesh = self.mesh;
        self.add(self.mesh);
        self.add(self.collisionMesh);
        this.frontWheels = [self.mesh.getObjectByName("Front_Left_Wheel_0"), self.mesh.getObjectByName("Front_Right_Wheel_1")];
        this.wheels = this.frontWheels.concat([self.mesh.getObjectByName("Rear_Wheel_2")]);
    }

    update(t, delta, track) {
        this.animate(t);
        this.getWorldDirection(this.orientation);
        this.computeClosestPoint(track.points);
        this.handleOutOfBounds(track);
        if (this.mesh) {
            this.changePosition(delta);
            this.setBoundingBox(this.mesh);
            //console.log(this.velocity * 100);
            this.slowReset();
            this.processModifiers();
            // console.log(this.velocity);
        }
        if (this.closestPointIndex === 1) this.addLap(track.checkpoints);
	}

    animate(t) {
		this.idleAnimation(t);
        if (this.wheels) this.changeWheelRotation();
    }

    slowReset() {
        this.velocity = Math.abs(this.velocity) <= 0.0001 ? 0 : 
                                this.velocity < 0 ? this.velocityWithRestrictions(this.velocity + 0.0001) :
                                this.velocityWithRestrictions(this.velocity - 0.0001);
        let offset = 0;
        if (Math.abs(this.wheelAngle) <= 0.01) {
            this.changeWheelYaw(-this.wheelAngle);
            this.wheelAngle = offset;
        } else {
            offset = this.wheelAngle < 0 ? 0.02 : -0.02;
            this.changeWheelYaw(offset);
        }
        this.angle = this.angle % (2*Math.PI);
    }

    saveDefaults() {
        this.defaultMaxSpeed = this.maxSpeed;
        this.defaultAcceleration = this.acceleration;
        this.defaultHandling = this.handling;
    }

    loadDefaults() {
        this.maxSpeed = this.defaultMaxSpeed;
        this.acceleration = this.defaultAcceleration;
        this.handling = this.defaultHandling;
    }

    changePosition(delta) {
        this.position.x += delta * this.velocity * Math.sin(this.angle);
        this.position.z += delta * this.velocity * Math.cos(this.angle);
    }

    resetPosition(trackPoints) {
        this.position.x = trackPoints[this.closestPointIndex].x;
        this.position.z = trackPoints[this.closestPointIndex].z;
        const direction = new THREE.Vector3().subVectors(trackPoints[(this.closestPointIndex + 1) % trackPoints.length], trackPoints[this.closestPointIndex]);
        const angle = signedAngleTo(this.orientation, direction);
        this.turn(angle / this.handling, true);
    }

    changeVelocity(inc) {
        return this.velocity = this.velocityWithRestrictions(this.velocity + inc * this.acceleration);
    }

    velocityWithRestrictions(v) {
        return Math.min(Math.max(-0.04, v), this.outOfBounds ? this.maxSpeed/7 : this.maxSpeed);
    }

    turn(angle, overrideVelocity=false) {
        const offset =  angle * this.handling;
        const modifier = overrideVelocity ? 1 : Math.min(1, this.velocity * 5);
        this.angle += offset * modifier;
        this.changeWheelYaw(offset * 3);
        return this.rotateY(offset * modifier);
    }

    changeWheelYaw(angle=0) {
        if (!this.wheels) return;
        if (angle != 0 && Math.abs(this.wheelAngle + angle) <= Math.PI/4) {
            for (const wheel of this.frontWheels) {
                wheel.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), angle);
            }
            this.wheelAngle += angle;
        }
        return this.wheelAngle;
    }

    changeWheelRotation() {
        for (const wheel of this.wheels) {
            wheel.rotateX(-this.velocity * 4);
        }
    }

    idleAnimation(t) {
        return this.translateY(sinWave(t, 0.002, 20));
	}

    handleOutOfBounds(track) {
        this.isOutOfBounds(track.points, track.width);
        this.needsReset(track.points, track.width);
    }

    isOutOfBounds(trackPoints, width) {
        //console.log(this.distanceToPoint(this.closestPointIndex, trackPoints))
        return this.outOfBounds = this.distanceToPoint(this.closestPointIndex, trackPoints) > width/2
    }

    needsReset(trackPoints, width) {
        if (this.distanceToPoint(this.closestPointIndex, trackPoints) > (width/2) * 2) this.resetPosition(trackPoints);
    }

    computeClosestPoint(trackPoints) {
        const range = 13;
        for (let i = 0; i < range; i++) {
            if (-Math.floor(range / 2) + i === 0) continue
            if (this.distanceToPoint(this.closestPointIndex - Math.floor(range / 2) + i, trackPoints) <= this.distanceToPoint(this.closestPointIndex, trackPoints)) {
                this.closestPointIndex = posMod(this.closestPointIndex - Math.floor(range / 2) + i, trackPoints.length - 1);
                this.addVisitedPoint(this.closestPointIndex);
                break;
            }
        }
        return this.closestPointIndex
    }

    addVisitedPoint(index) {
        if (!this.visitedPoints.includes(index)) this.visitedPoints.push(index);
    }

    distanceToPoint(idx, trackPoints) {
        return this.position.distanceTo(new THREE.Vector3(trackPoints[posMod(idx, trackPoints.length - 1)].x, this.position.y, trackPoints[posMod(idx, trackPoints.length - 1)].z))
    }

    addLap(checkpoints) {
        const checkpointsPassed = checkpoints.every(v => this.visitedPoints.includes(v));
        if (checkpointsPassed) {
            this.visitedPoints = [0, 1];
            this.completedLaps += 1;
        }
    }

    setRotation(angle) {
        this.angle = angle;
        return this.rotateY(angle);
    }

    processModifiers() {
        if (this.modifier === null) return;
        this.modifier.modifierFunc(this);
        if (this.modifier.modifyingSince.getElapsedTime() >= this.modifier.duration) {
            this.modifier.modifyingSince.stop();
            this.modifier = null;
            this.loadDefaults();
        }
    }
}

export {MyVehicle};