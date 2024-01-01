import * as THREE from "three";

class MySteeringWheel {
    constructor() {
        this.wheel = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.05), new THREE.MeshBasicMaterial({ color: 0x7d3a0e }));
        this.wheel.rotateY(Math.PI/2);
        this.texture = new THREE.TextureLoader().load("scenes/feupzero/textures/leather/fabric_0030_color_1k.png");
    }
}

export{ MySteeringWheel };