import * as THREE from "three";
import { MyApp } from "./MyApp.js";

class MyCandle extends THREE.Object3D {
    constructor(app, radius, height, segments, color) {
        super();
        this.app = app;
        this.type = "Group";
        this.radius = radius;
        this.height = height;
        this.segments = segments;
        this.color = color;
        this.candleShininess = 10;
        this.offset = Math.random();

        this.stick = new THREE.CylinderGeometry(
            this.radius,
            this.radius,
            this.height,
            this.segments,
            1,
            false
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
            Math.PI * 2,
            Math.PI / 2,
            Math.PI / 2
        );

        this.light = new THREE.PointLight(0xfff9d8, 1, 0.25, 0.5);

        this.stickMaterial = new THREE.MeshPhongMaterial({
            color: this.color,
            specular: "#ff0000",
            emissive: "#ff0000",
            emissiveIntensity: 0,
            shininess: this.candleShininess,
            side: THREE.FrontSide
        });

        this.flameMaterial = new THREE.MeshPhongMaterial({
            color: this.color,
            specular: "#2b2b2b",
            emissive: "#FFA500",
            shininess: this.candleShininess,
            side: THREE.FrontSide
        });

        this.candleMesh = new THREE.Mesh(this.stick, this.stickMaterial);
        this.candleMesh.castShadow = true;

        this.flameMesh = new THREE.Mesh(this.flame, this.flameMaterial);
        this.bottomFlameMesh = new THREE.Mesh(
            this.bottomFlame,
            this.flameMaterial
        );
        this.flameMesh.position.y =
            (2 * (this.radius * 1.5)) / 2 + this.height / 2;
        this.bottomFlameMesh.position.y =
            (this.radius * 1.5) / 2 + this.height / 2;
        this.light.position.y = 2 * (this.radius * 1.5) + this.height / 2;

        this.candleMesh.add(this.flameMesh);
        this.candleMesh.add(this.bottomFlameMesh);
        this.add(this.light);
        this.add(this.candleMesh);
    }

    update(t) {
        t = (t.getElapsedTime() / 10) % 1;

        this.light.intensity = Math.abs(
            Math.sin(3 * Math.PI * t + this.offset * Math.PI)
        );
        this.light.distance = Math.abs(
            Math.sin(3 * Math.PI * t + this.offset * Math.PI)
        );
        this.light.decay = Math.abs(
            Math.sin(3 * Math.PI * t + this.offset * Math.PI)
        );
    }
}

export { MyCandle };
