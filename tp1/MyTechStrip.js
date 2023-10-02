import * as THREE from "three";
import { MyApp } from "./MyApp.js";

class MyTechStrip extends THREE.Object3D {
    /**
     *
     * @param {MyApp} app the application object
     * @param {number} width the width of each shelf section
     * @param {number} height the height of each shelf section
     * @param {number} topHeight the height of each shelf section
     * @param {number} depth the depth of each shelf section
     * @param {number} rows the number of rows on the shelf
     * @param {number} cols the number of columns on the shelf
     */
    constructor(app, radius, angle) {
        super();
        this.app = app;
        this.type = "Group";
        this.radius = radius * 1.05;
        this.angle = 2 * angle;

        this.techStrip = new THREE.CylinderGeometry(
            this.radius,
            this.radius,
            this.radius * 0.2,
            this.segments,
            1,
            false,
            0,
            2*Math.PI - this.angle
        );
        this.techStripMaterial = new THREE.MeshPhongMaterial({
            color: "#000000",
            specular: "#000000",
            emissive: "#000000",
            emissiveIntensity: 0.1,
            shininess: this.coreShininess,
            side: THREE.DoubleSide
        });

        this.insidePlaneL = new THREE.PlaneGeometry(this.radius * 1.05, this.radius * 0.2, 1, 1);
        this.insidePlaneR = new THREE.PlaneGeometry(this.radius * 1.05, this.radius * 0.2, 1, 1);

        this.techStripMesh = new THREE.Mesh(this.techStrip, this.techStripMaterial);
        this.insidePlaneLMesh = new THREE.Mesh(this.insidePlaneL, this.techStripMaterial);
        this.insidePlaneRMesh = new THREE.Mesh(this.insidePlaneR, this.techStripMaterial);
        this.insidePlaneLMesh.position.z = Math.cos(this.angle) * (this.radius/2);
        this.insidePlaneLMesh.position.x = Math.sin(this.angle) * (this.radius/2);
        this.insidePlaneRMesh.position.z = this.radius/2;
        this.insidePlaneLMesh.rotateY(Math.PI / 2 + this.angle);
        this.insidePlaneRMesh.rotateY(Math.PI / 2);

        this.add(this.techStripMesh);
    }
}

export { MyTechStrip };
