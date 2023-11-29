import * as THREE from "three";
import { MyCollidingObject } from "./MyCollidingObject.js";

class MyObstacle extends MyCollidingObject {
    constructor(app, position, duration=5) {
        super(0xff0000);
        this.app = app;
        this.type = 'Group';
        this.duration = duration;
        this.material = new THREE.MeshBasicMaterial({color: 0xaa0000});
        this.mesh = new THREE.Mesh(new THREE.SphereGeometry(0.5), this.material);
        this.mesh.position.set(position.x, 1, position.z);
        console.log(this.position);
        this.setBoundingBox(this.mesh);
        this.addCollisionMesh(this.mesh);
        this.add(this.mesh);
        this.add(this.collisionMesh);
        console.log(this.boundingBox);
    }
}

export {MyObstacle};