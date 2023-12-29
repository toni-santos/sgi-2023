import * as THREE from "three";
import { MyShader } from "./MyShader.js";

class MyEnvironmentPlane extends THREE.Object3D {
    constructor(app, size, map, texture, vertexShader, fragmentShader) {
        super();
        this.app = app;

        this.texture = new THREE.TextureLoader().load(texture);
        this.texture.wrapS = THREE.RepeatWrapping;
        this.texture.wrapT = THREE.RepeatWrapping;
        this.map = new THREE.TextureLoader().load(map);
        
        this.plane = new THREE.Mesh(new THREE.PlaneGeometry(size, size, 100, 100), new THREE.MeshBasicMaterial());
        this.plane.rotateX(-Math.PI/2);

        this.shader = new MyShader(this.app, "Basic", "Basic shader", vertexShader, fragmentShader, {
            uSampler1: {type: 'sampler2D', value: this.map },
            uSampler2: {type: 'sampler2D', value: this.texture },
            offset: {type: 'float', value: 20.0},
        });
        this.plane.position.y = -0.1;
        this.waitForShaders();
        this.add(this.plane);
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

export { MyEnvironmentPlane };