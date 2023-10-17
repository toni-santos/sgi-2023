import * as THREE from "three";
import { MyNurbsBuilder } from "./MyNurbsBuilder.js";
import { MyApp } from "./MyApp.js";

class MyFlower extends THREE.Object3D {
    /**
     * 
     * @param {MyApp} app the application object
     * @param {number} stemHeight the height of the flower's stem
     * @param {number} petalCount the amount of petals in the flower
     * @param {number} petalColor the color of the flower's petals
     */
    constructor(app, stemHeight = 2, petalCount = 8, petalColor = 0x4444ff) {
        super();
        this.app = app;
        this.type = "Group";
        this.builder = new MyNurbsBuilder(this);

        this.stemHeight = stemHeight;
        this.petalCount = petalCount;
        this.petalColor = petalColor;

        this.pollenMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            map: new THREE.TextureLoader().load("textures/pollen.jpg"),
            side: THREE.DoubleSide
        });
        this.stemMaterial = new THREE.MeshPhongMaterial({
            color: 0x33dd33,
            side: THREE.DoubleSide
        });
        this.petalMaterial = new THREE.MeshPhongMaterial({
            color: petalColor,
            side: THREE.DoubleSide
        });

        // Central disk (pollen)
        this.pollen = new THREE.SphereGeometry(0.5);
        this.pollenMesh = new THREE.Mesh(this.pollen, this.pollenMaterial);
        this.pollenMesh.receiveShadow = true;

        // Stem
        const stemPoints = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, this.stemHeight / 2, 0),
            new THREE.Vector3(0, this.stemHeight / 2, -1),
            new THREE.Vector3(0, this.stemHeight, 0)
        ];
        this.stemCurve = new THREE.CubicBezierCurve3(...stemPoints);
        this.stem = new THREE.TubeGeometry(this.stemCurve, 32, 0.1);
        this.stemMesh = new THREE.Mesh(this.stem, this.stemMaterial);
        this.stemMesh.receiveShadow = true;

        // Petals
        this.petalMeshes = [];
        const petalPoints = [
            // U = 0
            [
                // V = 0..1;
                [-0.2, -0.3, 0.0, 1],
                [-0.3, 0, 0.0, 1],
                [0, 0.3, 0.0, 1]
            ],
            // U = 1
            [
                // V = 0..1
                [0.2, -0.3, 0, 1],
                [0.3, 0, 0, 1],
                [0, 0.3, 0, 1]
            ]
        ];
        this.petal = this.builder.build(
            petalPoints,
            1,
            2,
            20,
            20,
            this.petalMaterial
        );

        this.createPetals();
        this.transformMeshes();
        this.addMeshes();
    }

    createPetals() {
        let petalMesh;
        let offset = Math.PI / (this.petalCount * 0.5);
        for (let i = 0; i < this.petalCount; i++) {
            petalMesh = new THREE.Mesh(this.petal, this.petalMaterial);
            petalMesh.rotateZ(-Math.PI / 2 + i * offset);
            petalMesh.position.set(
                0.7 * Math.cos(i * offset),
                0.7 * Math.sin(i * offset),
                0
            );
            petalMesh.receiveShadow = true;
            this.petalMeshes.push(petalMesh);
        }
    }

    transformMeshes() {
        this.pollenMesh.scale.set(1, 1, 0.5);
        this.pollenMesh.rotateX(-Math.PI / 4);
        this.stemMesh.position.y = -this.stemHeight;
    }

    addMeshes() {
        for (let petalMesh of this.petalMeshes) this.pollenMesh.add(petalMesh);
        this.add(this.pollenMesh);
        this.add(this.stemMesh);
    }
}

export { MyFlower };
