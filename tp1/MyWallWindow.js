import * as THREE from "three";
import { MyApp } from "./MyApp.js";

class MyWallWindow extends THREE.Object3D {
    constructor(app, width, height, segments, color, holeMeasures, object) {
        super();
        this.app = app;
        this.type = "Group";
        this.width = width;
        this.height = height;
        this.segments = segments;
        this.color = color;
        this.holeMeasures = holeMeasures; 
        this.object = object;
        this.depth = 0.2;

        this.wallMaterial = new THREE.MeshPhongMaterial({
            color: this.color,
            specular: "#ffffff",
            emissive: "#000000",
            shininess: 1,
            side: THREE.DoubleSide
        });

        this.leftOffset = this.width * this.holeMeasures.left;
        this.rightOffset = this.width * this.holeMeasures.right;
        this.topOffset = this.height * this.holeMeasures.top;
        this.botOffset = this.height * this.holeMeasures.bot;

        console.log(this.leftOffset, this.rightOffset, this.topOffset, this.botOffset);

        this.top = new THREE.BoxGeometry(
            width - (this.leftOffset + this.rightOffset),
            this.topOffset,
            this.depth,
        );
        
        this.bot = new THREE.BoxGeometry(
            width - (this.leftOffset + this.rightOffset),
            this.botOffset,
            this.depth,
        );

        this.right = new THREE.BoxGeometry(
            this.rightOffset,
            height,
            this.depth,
        );

        this.left = new THREE.BoxGeometry(
            this.leftOffset,
            height,
            this.depth,
        );

        this.leftMesh = new THREE.Mesh(this.left, this.wallMaterial);
        this.rightMesh = new THREE.Mesh(this.right, this.wallMaterial);
        this.topMesh = new THREE.Mesh(this.top, this.wallMaterial);
        this.botMesh = new THREE.Mesh(this.bot, this.wallMaterial);

        this.leftMesh.position.set(-width/2 + this.leftOffset/2, 0, 0);
        this.rightMesh.position.set(width/2 - this.rightOffset/2, 0, 0);
        this.botMesh.position.set((this.leftOffset - this.rightOffset)/2, -height/2 + this.botOffset/2, 0);
        this.topMesh.position.set((this.leftOffset - this.rightOffset)/2, height/2 - this.topOffset/2, 0);
        this.add(this.leftMesh);
        this.add(this.rightMesh);
        this.add(this.topMesh);
        this.add(this.botMesh);

    }
}

export { MyWallWindow };
