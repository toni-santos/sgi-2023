import * as THREE from "three";
import { MyCollidingObject } from "./MyCollidingObject.js";
import { sinWave } from "../helper/MyAnimations.js";
import { posMod } from "../helper/MyUtils.js";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class MyVehicle extends MyCollidingObject {
    constructor(app, model, maxSpeed=30, acceleration=1.9, handling=1.5) {
        super(app, 0xff00ff);
        this.maxSpeed = maxSpeed / 100;
        this.acceleration = acceleration;
        this.handling = handling;
        this.saveDefaults();
        this.app = app;
        this.type = 'Group';
        this.velocity = 0;
        this.angle = 0;
        this.orientation = new THREE.Vector3(0, 0, 1);
        this.closestPointIndex = 0;
        this.outOfBounds = false;
        this.modifier = null;
        // this.material = new THREE.MeshBasicMaterial({color: 0xff00ff});
        // this.mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 0.5, 2), this.material);
        // this.mesh.position.z += 0.5;
        // this.setBoundingBox(this.mesh);
        // this.addCollisionMesh(this.mesh);
        // this.add(this.mesh);
        // this.add(this.collisionMesh);
        // console.log(this.boundingBox);
        this.name = model;
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
                child.name = self.name;
            }
        });
        // self.mesh.scale.set(0.01, 0.01, 0.01);
        self.mesh.rotateY(Math.PI/2);
        self.setBoundingBox(self.mesh);
        self.addCollisionMesh(self.mesh);
        self.add(self.mesh);
        self.add(self.collisionMesh);
        console.log("done");
    }

    update(t) {
		this.idleAnimation(t);
        this.getWorldDirection(this.orientation);
        this.changePosition();
        this.setBoundingBox(this.mesh);
        //console.log(this.velocity * 100);
        this.velocity = Math.abs(this.velocity) <= 0.0001 ? 0 : 
                                this.velocity < 0 ? this.velocity + 0.0001 :
                                this.velocity - 0.0001;
        this.processModifiers();
        // console.log(this.velocity);
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

    changePosition() {
        this.position.x += 1 * this.velocity * Math.sin(this.angle);
        this.position.z += 1 * this.velocity * Math.cos(this.angle);
    }

    changeVelocity(inc) {
        return this.velocity = Math.min(Math.max(-0.04, this.velocity + inc * this.acceleration), this.outOfBounds ? this.maxSpeed/7 : this.maxSpeed);
    }

    turn(angle) {
        this.angle += angle * this.handling;
        return this.rotateY(angle * this.handling);
    }

    idleAnimation(t) {
        return this.translateY(sinWave(t, 0.01, 2));
	}

    isOutOfBounds(trackPoints, width) {
        //console.log(this.distanceToPoint(this.closestPointIndex, trackPoints))
        return this.outOfBounds = this.distanceToPoint(this.closestPointIndex, trackPoints) > width/2
    }

    computeClosestPoint(trackPoints) {
        const range = 13;
        for (let i = 0; i < range; i++) {
            if (-Math.floor(range / 2) + i === 0) continue
            if (this.distanceToPoint(this.closestPointIndex - Math.floor(range / 2) + i, trackPoints) <= this.distanceToPoint(this.closestPointIndex, trackPoints)) {
                this.closestPointIndex = posMod(this.closestPointIndex - Math.floor(range / 2) + i, trackPoints.length - 1);
                break;
            }
        }
        //console.log(this.closestPointIndex);
        return this.closestPointIndex
    }

    distanceToPoint(idx, trackPoints) {
        return this.position.distanceTo(new THREE.Vector3(trackPoints[posMod(idx, trackPoints.length - 1)].x, this.position.y, trackPoints[posMod(idx, trackPoints.length - 1)].z))
    }

    setRotation(angle) {
        this.angle = angle;
        return this.rotateY(angle);
    }

    processModifiers() {
        if (this.modifier === null) return;
        this.modifier.modifierFunc(this);
        console.log(this.modifier.modifyingSince.getElapsedTime());
        if (this.modifier.modifyingSince.getElapsedTime() >= this.modifier.duration) {
            this.modifier.modifyingSince.stop();
            this.modifier = null;
            this.loadDefaults();
        }
    }
}

export {MyVehicle};