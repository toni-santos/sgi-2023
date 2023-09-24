import * as THREE from "three";
import { MyApp } from "./MyApp.js";

class MyPersonalityCore extends THREE.Object3D {
    constructor(app, radius, segments, color, object) {
        super();
        this.app = app;
        this.type = "Group";
        this.radius = radius;
        this.segments = segments;
        this.color = color;
        this.object = object;
        this.coreShininess = 10;
        
        this.core = new THREE.SphereGeometry(
            this.radius,
            this.segments,
            this.segments,
            0,
            Math.PI * 2,
            Math.PI/5,
            2.57610597594363
        );
        this.coreBulb = new THREE.SphereGeometry(
            this.radius * 0.99,
            this.segments,
            this.segments,
            0,
            Math.PI * 2,
            0,
            Math.PI/5
        );
        this.plane = new THREE.CircleGeometry(
            Math.sin(Math.PI/5) * this.radius,
            this.segments
        );
        this.coreLight = new THREE.PointLight(
            0xe38b27,
            1,
            100
        );

        this.coreMaterial = new THREE.MeshPhongMaterial({
            color: this.color,
            specular: "#ffffff",
            emissive: "#ffffff",
            emissiveIntensity: 0.1,
            shininess: this.coreShininess,
            side: THREE.DoubleSide
        });

        this.bulbMaterial = new THREE.MeshPhongMaterial({
            color: this.color,
            specular: "#e38b27",
            emissive: "#e38b27",
            emissiveIntensity: 1,
            shininess: this.coreShininess,
            side: THREE.DoubleSide
        });

        this.coreMesh = new THREE.Mesh(this.core, this.coreMaterial);
        this.coreBulbMesh = new THREE.Mesh(this.coreBulb, this.bulbMaterial);
        this.planeMesh = new THREE.Mesh(this.plane, this.coreMaterial);
        this.planeMesh.rotation.x = Math.PI / 2;
        this.planeMesh.position.y = Math.cos(Math.PI/5) * this.radius ;
        this.coreLight.position.y = Math.cos(Math.PI/5) * this.radius ;
        this.coreBulbMesh.position.y = 0;
        this.coreMesh.add(this.coreLight);
        this.coreMesh.add(this.planeMesh);
        this.coreMesh.add(this.coreBulbMesh);
        this.add(this.coreMesh);
    }
}

export { MyPersonalityCore };
