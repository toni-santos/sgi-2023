import * as THREE from "three";

class MyOilSpill {
    constructor() {
        this.oilSpill = new THREE.Mesh(new THREE.SphereGeometry(0.5), new THREE.MeshBasicMaterial({ color: 0x2a2a2a }));
        this.oilSpill.scale.set(1.2, 0.3, 1.2);
        this.texture = new THREE.TextureLoader().load("scenes/feupzero/textures/leather/fabric_0030_color_1k.jpg");
    }
}

export{ MyOilSpill };