import * as THREE from "three";
import { MyApp } from "./MyApp.js";

class MyCandle extends THREE.Object3D {
    constructor(app, radius, height, segments, color, lightHelper, object) {
        super();
        this.app = app;
        this.type = "Group";
        this.radius = radius;
        this.height = height;
        this.segments = segments;
        this.color = color;
        this.object = object;
        this.candleShininess = 10;
        this.lightHelper = lightHelper;

        this.stick = new THREE.CylinderGeometry(
            this.radius,
            this.radius,
            this.height,
            this.segments,
            1,
            false,
        );

        this.flame = new THREE.ConeGeometry(
            this.radius * 0.9,
            this.radius * 1.5,
            segments,
            1,
            false
        );

        this.bottomFlame = new THREE.SphereGeometry(
            this.radius * 0.9,
            this.segments,
            this.segments,
            0,
            Math.PI*2,
            Math.PI/2,
            Math.PI/2,
        );

        this.light = new THREE.PointLight(
            0xfff9d8,
            0.5,
            3,
            2
        );

        this.stickMaterial = new THREE.MeshPhongMaterial({
            color: this.color,
            specular: "#ff0000",
            emissive: "#ff0000",
            emissiveIntensity: 0.3,
            shininess: this.candleShininess,
            side: THREE.FrontSide
        });

        this.flameMaterial = new THREE.MeshPhongMaterial({
            color: this.color,
            specular: "#2b2b2b",
            emissive: "#FFA500",
            shininess: this.candleShininess,
            side: THREE.FrontSide,
        });

        this.candleMesh = new THREE.Mesh(this.stick, this.stickMaterial);
        this.flameMesh = new THREE.Mesh(this.flame, this.flameMaterial);
        this.bottomFlameMesh = new THREE.Mesh(this.bottomFlame, this.flameMaterial);
        this.flameMesh.position.y =  2 * (this.radius * 1.5) / 2 + this.height/2;
        this.bottomFlameMesh.position.y = (this.radius * 1.5) / 2 + this.height/2;
        this.light.position.y = 2 * (this.radius * 1.5) + this.height/2;
        
        this.candleMesh.add(this.flameMesh);
        this.candleMesh.add(this.bottomFlameMesh);
        this.add(this.light);
        this.add(this.candleMesh);
    }
}

export { MyCandle };
