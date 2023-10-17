import * as THREE from "three";
import { MyApp } from "./MyApp.js";
import { MyTechStrip } from "./MyTechStrip.js";

class MyPersonalityCore extends THREE.Object3D {
    /**
     * 
     * @param {MyApp} app the application object
     * @param {number} radius the radius of the core sphere
     * @param {number} segments the radial segments of the core sphere
     * @param {number} color the color of the core bulb
     * @param {THREE.SpotLight} light the radius of the core sphere
     * @param {number} lightColor the color of the core bulb
     */
    constructor(app, radius, segments, color, light, lightColor) {
        super();
        this.app = app;
        this.type = "Group";
        this.radius = radius;
        this.segments = segments;
        this.color = color;
        this.coreShininess = 10;
        this.coreLight = light;
        this.lightColor = lightColor;

        this.core = new THREE.SphereGeometry(
            this.radius,
            this.segments,
            this.segments,
            0,
            Math.PI * 2,
            Math.PI / 5,
            2.57610597594363
        );
        this.coreBulb = new THREE.SphereGeometry(
            this.radius * 0.99,
            this.segments,
            this.segments,
            0,
            Math.PI * 2,
            0,
            Math.PI / 5
        );
        this.plane = new THREE.CircleGeometry(
            Math.sin(Math.PI / 5) * this.radius,
            this.segments
        );
        this.techStrip = new MyTechStrip(this.app, this.radius, Math.PI / 5);

        this.metallicTexture = new THREE.TextureLoader().load(
            "textures/metallic_sheen.jpg"
        );
        this.metallicTexture.wrapS = THREE.RepeatWrapping;
        this.metallicTexture.wrapT = THREE.RepeatWrapping;

        this.coreMaterial = new THREE.MeshPhongMaterial({
            color: 0xdbd0d0,
            specular: "#dbd0d0",
            emissive: "#808080",
            emissiveIntensity: 0,
            map: this.metallicTexture,
            shininess: 10,
            side: THREE.DoubleSide
        });

        this.bulbMaterial = new THREE.MeshPhongMaterial({
            color: this.color,
            specular: this.lightColor,
            emissive: this.lightColor,
            emissiveIntensity: 1,
            shininess: this.coreShininess,
            side: THREE.DoubleSide
        });

        this.coreMesh = new THREE.Mesh(this.core, this.coreMaterial);
        this.coreMesh.castShadow = true;
        this.coreBulbMesh = new THREE.Mesh(this.coreBulb, this.bulbMaterial);
        this.coreBulbMesh.castShadow = true;
        this.planeMesh = new THREE.Mesh(this.plane, this.coreMaterial);
        this.planeMesh.castShadow = true;
        this.planeMesh.rotation.x = Math.PI / 2;
        this.planeMesh.position.y = Math.cos(Math.PI / 5) * this.radius;
        this.coreLight.position.y = Math.cos(Math.PI / 5) * this.radius;
        this.techStrip.rotateX(-Math.PI / 2);
        this.techStrip.rotateY(Math.PI / 5);
        this.coreMesh.add(this.coreLight);
        this.coreMesh.add(this.planeMesh);
        this.coreMesh.add(this.coreBulbMesh);
        this.coreMesh.add(this.techStrip);
        this.add(this.coreMesh);
    }
}

export { MyPersonalityCore };
