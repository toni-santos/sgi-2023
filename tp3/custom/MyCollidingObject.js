import * as THREE from "three";

class MyCollidingObject extends THREE.Object3D {
    constructor(app, color) {
        super();
        this.app = app;
        this.type = 'Group';
        this.material = new THREE.MeshBasicMaterial({color: color});
        this.mesh = new THREE.Mesh(new THREE.SphereGeometry(), this.material);
        this.add(this.mesh);
    }
}

export {MyCollidingObject};