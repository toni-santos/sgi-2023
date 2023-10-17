import * as THREE from "three";
import { MyFrame } from "./MyFrame.js";

class MyWindow extends THREE.Object3D {
    constructor(app, width, height, color, landscapeTexture) {
        super();
        this.app = app;
        this.type = "Group";
        this.width = width;
        this.height = height;
        this.color = color;
        this.landscapeTexture = landscapeTexture;
        this.frameShininess = 2;
        this.depth = 0.2;

        this.landscapeMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            specular: "#ffffff",
            emissive: "#000000",
            emissiveIntensity: 0,
            map: this.landscapeTexture,
            shininess: this.frameShininess
        });

        this.outerFrame = new MyFrame(
            this.app,
            this.width,
            this.height,
            5,
            0xffffff
        );
        this.outerFrame.remove(this.outerFrame.backMesh);

        this.landscape = new THREE.PlaneGeometry(this.width, this.height);
        this.landscapeMesh = new THREE.Mesh(
            this.landscape,
            this.landscapeMaterial
        );

        this.gridH = new THREE.BoxGeometry(this.width, this.depth, this.depth);
        this.gridHMesh = new THREE.Mesh(
            this.gridH,
            this.outerFrame.frameMaterial
        );
        this.gridHMesh.position.set(0, 0, this.depth / 2);

        this.gridV = new THREE.BoxGeometry(this.depth, this.height, this.depth);
        this.gridVMesh = new THREE.Mesh(
            this.gridV,
            this.outerFrame.frameMaterial
        );
        this.gridVMesh.position.set(0, 0, this.depth / 2);

        this.add(this.landscapeMesh);
        this.add(this.gridHMesh);
        this.add(this.gridVMesh);
        this.add(this.outerFrame);
    }
}

export { MyWindow };
