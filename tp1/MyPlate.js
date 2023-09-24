import * as THREE from "three";
import { MyApp } from "./MyApp.js";
import { MyCake } from "./MyCake.js";

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
            this.radius * 1.5,
            this.radius,
            this.radius / 4,
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
        this.cake = new MyCake(this.app, this.radius, 0.5, 32, 0x80461B, 10);

        this.plateMesh = new THREE.Mesh(this.plate, this.plateMaterial);
        this.plateBaseMesh = new THREE.Mesh(this.plateBase, this.plateMaterial);
        this.plateMesh.rotation.x = Math.PI / 2;
        this.plateMesh.position.z = this.radius/8;
        this.cake.rotateX(Math.PI / 2);
        this.cake.position.z = this.cake.height / 1.9;
        this.plateBaseMesh.add(this.plateMesh);
        this.plateBaseMesh.add(this.cake);
        this.add(this.plateBaseMesh);
    }
}

MyPlate.prototype.isGroup = true;

export { MyPlate };
