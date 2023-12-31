import * as THREE from "three";

class MyCollidingObject extends THREE.Object3D {
    constructor(app, color) {
        super();
        this.app = app;
        this.type = 'Group';
        this.boundingBox = new THREE.Box3();
        this.collisionMesh = null;
        this.collisionMaterial = new THREE.MeshBasicMaterial({color: color});
    }

    setBoundingBox(object) {
        this.boundingBox = new THREE.Box3().setFromObject(object);
    }

    addCollisionMesh(mesh) {
        this.collisionMesh = new THREE.BoxHelper(mesh, 0xff0000);
        this.add(this.collisionMesh);
        this.toggleCollisionMesh(false);
    }

    toggleCollisionMesh(value) {
        return this.collisionMesh.visible = value;
    }
}

export {MyCollidingObject};