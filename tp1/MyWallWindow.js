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

        this.sillMaterial = new THREE.MeshPhongMaterial({
            color: 0x1f2021,
            specular: "#1f2021",
            emissive: "#000000",
            emissiveIntensity: 0,
        });

        this.glassMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xd1d1d1,
            roughness: 0,  
            transmission: 1,
            thickness: 0.2,
            side: THREE.DoubleSide,
        });

        this.leftOffset = this.width * this.holeMeasures.left;
        this.rightOffset = this.width * this.holeMeasures.right;
        this.topOffset = this.height * this.holeMeasures.top;
        this.botOffset = this.height * this.holeMeasures.bot;


        this.windowSillVer = new THREE.BoxGeometry(
            this.depth * 0.2,
            this.height - (this.topOffset + this.botOffset),
            this.depth * 1.2,
        );

        this.windowSillHor = new THREE.BoxGeometry(
            this.width - (this.leftOffset + this.rightOffset),
            this.depth * 0.2,
            this.depth * 1.2,
        );

        this.glass = new THREE.PlaneGeometry(
            this.width - (this.leftOffset + this.rightOffset),
            this.height - (this.topOffset + this.botOffset),
            this.segments,
            this.segments
        );

        this.horizontal = new THREE.BoxGeometry(
            this.width - (this.leftOffset + this.rightOffset),
            this.topOffset,
            this.depth,
        );

        this.vertical = new THREE.BoxGeometry(
            this.rightOffset,
            this.height,
            this.depth,
        );

        this.leftMesh = new THREE.Mesh(this.vertical, this.wallMaterial);
        this.rightMesh = new THREE.Mesh(this.vertical, this.wallMaterial);
        this.topMesh = new THREE.Mesh(this.horizontal, this.wallMaterial);
        this.botMesh = new THREE.Mesh(this.horizontal, this.wallMaterial);

        this.leftMesh.position.set(-width/2 + this.leftOffset/2, 0, 0);
        this.rightMesh.position.set(width/2 - this.rightOffset/2, 0, 0);
        this.botMesh.position.set((this.leftOffset - this.rightOffset)/2, -height/2 + this.botOffset/2, 0);
        this.topMesh.position.set((this.leftOffset - this.rightOffset)/2, height/2 - this.topOffset/2, 0);
        
        this.sillLeftMesh = new THREE.Mesh(this.windowSillVer, this.sillMaterial);
        this.sillRightMesh = new THREE.Mesh(this.windowSillVer, this.sillMaterial);
        this.sillTopMesh = new THREE.Mesh(this.windowSillHor, this.sillMaterial);
        this.sillBotMesh = new THREE.Mesh(this.windowSillHor, this.sillMaterial);

        this.sillBotMesh.position.set((this.leftOffset - this.rightOffset), -height/2 + this.botOffset, 0);
        this.sillTopMesh.position.set((this.leftOffset - this.rightOffset), height/2 - this.topOffset, 0);
        this.sillRightMesh.position.set(width/2 - this.rightOffset, (this.topOffset - this.botOffset), 0);
        this.sillLeftMesh.position.set(-width/2 + this.leftOffset, (this.topOffset - this.botOffset), 0);
        
        this.glassMesh = new THREE.Mesh(this.glass, this.glassMaterial);

        this.glassMesh.position.set((this.leftOffset - this.rightOffset)/2, (this.topOffset - this.botOffset)/2, 0);

        this.add(this.leftMesh);
        this.add(this.rightMesh);
        this.add(this.topMesh);
        this.add(this.botMesh);

        this.add(this.sillBotMesh);
        this.add(this.sillTopMesh);
        this.add(this.sillLeftMesh);
        this.add(this.sillRightMesh);

        this.add(this.glassMesh);

    }
}

export { MyWallWindow };
