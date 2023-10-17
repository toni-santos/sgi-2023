import * as THREE from "three";
import { MyApp } from "./MyApp.js";

class MyFrame extends THREE.Object3D {
    constructor(app, width, height, segments, color, imageTexture, object) {
        super();
        this.app = app;
        this.type = "Group";
        this.width = width;
        this.height = height;
        this.segments = segments;
        this.color = color;
        this.imageTexture = imageTexture;
        this.object = object;
        this.frameShininess = 2;
        this.depth = 0.2;

        this.woodTexture = new THREE.TextureLoader().load("textures/wood.jpg");
        this.woodTexture.wrapS = THREE.RepeatWrapping;
        this.woodTexture.wrapT = THREE.RepeatWrapping;

        this.frameMaterial = new THREE.MeshPhongMaterial({
            color: this.color,
            specular: this.color,
            emissive: this.color,
            emissiveIntensity: 0,
            map: this.woodTexture,
            shininess: this.frameShininess,
            side: THREE.FrontSide
        });

        this.imageMaterial = new THREE.MeshPhongMaterial({
            map: this.imageTexture ?? null
        });

        this.frameBack = new THREE.PlaneGeometry(
            width,
            height,
            segments,
            segments
        );

        this.image = new THREE.PlaneGeometry(width, height, segments, segments);

        this.frameTop = new THREE.BoxGeometry(width, this.depth, this.depth);

        this.frameBot = new THREE.BoxGeometry(width, this.depth, this.depth);

        this.frameLeft = new THREE.BoxGeometry(height, this.depth, this.depth);
        this.frameRight = new THREE.BoxGeometry(height, this.depth, this.depth);

        this.backMesh = new THREE.Mesh(this.frameBack, this.frameMaterial);
        this.topMesh = new THREE.Mesh(this.frameTop, this.frameMaterial);
        this.botMesh = new THREE.Mesh(this.frameBot, this.frameMaterial);
        this.leftMesh = new THREE.Mesh(this.frameLeft, this.frameMaterial);
        this.rightMesh = new THREE.Mesh(this.frameRight, this.frameMaterial);
        this.imageMesh = new THREE.Mesh(this.image, this.imageMaterial);
        this.backMesh.castShadow = true;
        this.backMesh.receiveShadow = true;
        this.backMesh.receiveShadow = true;
        this.topMesh.castShadow = true;
        this.topMesh.receiveShadow = true;
        this.botMesh.castShadow = true;
        this.botMesh.receiveShadow = true;
        this.leftMesh.castShadow = true;
        this.leftMesh.receiveShadow = true;
        this.rightMesh.castShadow = true;
        this.rightMesh.receiveShadow = true;
        this.imageMesh.castShadow = true;
        this.imageMesh.receiveShadow = true;

        this.backMesh.position.set(0, 0, -0.01);
        this.backMesh.rotateY(Math.PI);
        this.imageMesh.position.set(0, 0, this.depth * 0.9);
        this.add(this.imageMesh);
        this.add(this.topMesh);
        this.add(this.botMesh);
        this.add(this.leftMesh);
        this.add(this.rightMesh);
        this.leftMesh.rotateZ(Math.PI / 2);
        this.rightMesh.rotateZ(Math.PI / 2);
        this.topMesh.position.set(0, height / 2, this.depth / 2);
        this.botMesh.position.set(0, -height / 2, this.depth / 2);
        this.leftMesh.position.set(
            -width / 2 + this.depth / 2,
            0,
            this.depth / 2
        );
        this.rightMesh.position.set(
            width / 2 - this.depth / 2,
            0,
            this.depth / 2
        );
        this.add(this.backMesh);
    }
}

MyFrame.prototype.isGroup = true;

export { MyFrame };
