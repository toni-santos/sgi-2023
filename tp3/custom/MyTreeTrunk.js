import * as THREE from "three";

class MyTreeTrunk {
    constructor(length = 1, radius = 0.25) {
        this.trunk = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 32), new THREE.MeshBasicMaterial({ color: 0x7d3a0e }));
        this.trunk.position.set(0, radius/2, 0);
        this.trunk.rotateZ(Math.PI / 2);
    }
}

export { MyTreeTrunk };