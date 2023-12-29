import * as THREE from "three";
import { MyShader } from "./MyShader.js";

class MyShaderBillboard extends THREE.Object3D {
    
    constructor(app, map, texture, vertexShader, fragmentShader) {
        super();
        this.app = app;

        this.texture = new THREE.TextureLoader().load(texture);
        this.map = new THREE.TextureLoader().load(map);
        this.map.wrapS = THREE.RepeatWrapping;
        this.map.wrapT = THREE.RepeatWrapping;

        this.border = new THREE.Mesh();

        this.border.material = new THREE.MeshBasicMaterial({color: 0xdae3e8});

        this.borderT = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.1, 0.1), this.border.material);
        this.borderB = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.1, 0.1), this.border.material);
        this.borderL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 1.1), this.border.material);
        this.borderR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 1.1), this.border.material);

        this.borderT.position.set(0, -0.1, 0.5);
        this.borderB.position.set(0, -0.1, -0.5);
        this.borderL.position.set(0.85, -0.1, 0);
        this.borderR.position.set(-0.85, -0.1, 0);

        this.barL = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.85), this.border.material);
        this.barR = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.85), this.border.material);

        this.barL.rotateX(Math.PI/2);
        this.barR.rotateX(Math.PI/2);
        this.barL.position.set(0.5, -0.1, 0.5);
        this.barR.position.set(-0.5, -0.1, 0.5);

        this.borderBack = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1, 100, 100), this.border.material);
        this.borderBack.rotateX(-Math.PI/2);
        this.borderBack.position.set(0, -0.1, 0);
        this.borderBack.material.side = THREE.DoubleSide;

        this.border.add(this.borderT, this.borderB, this.borderL, this.borderR, this.barL, this.barR, this.borderBack);

        this.plane = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1, 100, 100), new THREE.MeshBasicMaterial());
        this.plane.rotateX(-Math.PI/2);

        this.shader = new MyShader(this.app, "Basic", "Basic shader", vertexShader, fragmentShader, {
            uSampler1: {type: 'sampler2D', value: this.map },
            uSampler2: {type: 'sampler2D', value: this.texture },
            offset: {type: 'float', value: 0.2},
        }),

        this.waitForShaders();
        this.rotateX(Math.PI/2)
        this.add(this.plane, this.border);
    }

    waitForShaders() {
        if (this.shader.ready === false) {
            setTimeout(this.waitForShaders.bind(this), 100)
            return;
        }
        this.plane.material = this.shader.material;
        this.plane.material.needsUpdate = true;
    }
}

export { MyShaderBillboard };