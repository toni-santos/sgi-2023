import * as THREE from "three";
import { MyCollidingObject } from "./MyCollidingObject.js";

class MyVehicle extends MyCollidingObject {
    constructor(app) {
        super(app, 0xff00ff);
        this.app = app;
        this.type = 'Group';
        this.material = new THREE.MeshBasicMaterial({color: 0xff00ff});
        this.mesh = new THREE.Mesh(new THREE.BoxGeometry(2, 0.5, 1), this.material);
        this.mesh.geometry.computeBoundingBox();
        this.collisionMesh = this.addCollisionMesh(this.mesh);
        this.add(this.mesh);
        this.add(this.collisionMesh);
        console.log(this.mesh.geometry.boundingBox);
    }
}

export {MyVehicle};