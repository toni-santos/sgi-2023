import * as THREE from "three";

class MyWheel extends THREE.Object3D {
    constructor(app, wheelRadius = 0.13, wheelTube = 0.05) {
        super();
        this.app = app;
        this.wheelTube = wheelTube;
        this.wheelRadius = wheelRadius;
        this.wheel = new THREE.TorusGeometry(this.wheelRadius, this.wheelTube, 10, 18);
        this.wheelMat = new THREE.MeshStandardMaterial({
            map: new THREE.TextureLoader().load("scenes/feupzero/textures/wheel/plastic_0022_color_1k.jpg"),
            aoMap: new THREE.TextureLoader().load("scenes/feupzero/textures/wheel/plastic_0022_ao_1k.jpg"),
            normalMap: new THREE.TextureLoader().load("scenes/feupzero/textures/wheel/plastic_0022_normal_1k.jpg"),
            roughnessMap: new THREE.TextureLoader().load("scenes/feupzero/textures/wheel/plastic_0022_roughness_1k.jpg"),
            bumpMap: new THREE.TextureLoader().load("scenes/feupzero/textures/wheel/plastic_0022_height_1k.jpg"),
            bumpScale: 1,
            aoMap: new THREE.TextureLoader().load("scenes/feupzero/textures/wheel/plastic_0022_ao_1k.jpg"),
        });
        this.wheelMesh = new THREE.Mesh(this.wheel, this.wheelMat);
        this.wheelMesh.castShadow = true;
        this.add(this.wheelMesh);
        this.wheelMesh.rotateX(Math.PI / 2);
    }
}

export { MyWheel };