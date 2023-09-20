import * as THREE from "three";
import { MyApp } from "./MyApp.js";

class MyPlate extends THREE.Object3D {
    /**
     *
     * @param {MyApp} app the application object
     * @param {number} radius the radius of the plate
     * @param {number} color the color of the plate
     * @param {THREE.Object3D | undefined} object the object in the plate (Optional).
     */
    constructor(app, radius, segments, color, object) {
        super();
        this.app = app;
        this.type = "Group";
        this.radius = radius;
        this.segments = segments;
        this.color = color;
        this.object = object;
        this.plateShininess = 20;

        this.plate = new THREE.CylinderGeometry(
            this.radius * 2,
            this.radius,
            this.radius / 2,
            this.segments,
            1,
            true
        );
        this.plateBase = new THREE.CircleGeometry(this.radius, this.segments);
        this.plateMaterial = new THREE.MeshPhongMaterial({
            color: this.color,
            specular: "#ffffff",
            emissive: "#000000",
            shininess: this.plateShininess,
            side: THREE.DoubleSide
        });

        this.plateMesh = new THREE.Mesh(this.plate, this.plateMaterial);
        this.plateBaseMesh = new THREE.Mesh(this.plateBase, this.plateMaterial);
        this.plateMesh.rotation.x = Math.PI / 2;
        this.plateMesh.position.z = this.radius / 4;
        this.plateBaseMesh.add(this.plateMesh);
        this.add(this.plateBaseMesh);
    }
}

MyPlate.prototype.isGroup = true;

export { MyPlate };
