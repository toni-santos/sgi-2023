import * as THREE from "three";

class MyCollidingObject extends THREE.Object3D {
    constructor(app, color) {
        super();
        this.app = app;
        this.type = 'Group';
        this.collisionMesh = null;
        this.collisionMaterial = new THREE.MeshBasicMaterial({color: color});
    }

    addCollisionMesh(mesh) {
        return new THREE.BoxHelper(mesh, 0xff0000);
    }

    toggleCollisionMesh(value) {
        return this.collisionMesh.visible = value;
    }
}

export {MyCollidingObject};