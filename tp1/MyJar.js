import * as THREE from "three";
import { MyApp } from "./MyApp.js";
import { MyNurbsBuilder } from "./MyNurbsBuilder.js";

class MyJar extends THREE.Object3D {
    constructor(app) {
        super();
        this.app = app;
        this.type = "Group";
        this.builder = new MyNurbsBuilder();
        this.jarMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            map: new THREE.TextureLoader().load("textures/glass.png"),
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.5
        });
        this.lidMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            map: new THREE.TextureLoader().load("textures/wood.jpg"),
            side: THREE.DoubleSide
        });

        const controlPoints = [
            // U = 0
            [
                // V = 0..1;
                [-0.1, -0.5, 0.0, 1],
                [-0.5, -0.5, 0.0, 1],
                [-0.5, -0.4, 0.0, 1],
                [-0.5, 0.4, 0.0, 1],
                [-0.5, 0.5, 0.0, 1],
                [-0.5 * 0.8, 0.5, 0.0, 1]
            ],

            // U = 1
            [
                // V = 0..1
                [-0.1, -0.5, 0, 1],
                [-0.5, -0.5, 2 / 3, 1],
                [-0.5, -0.4, 2 / 3, 1],
                [-0.5, 0.4, 2 / 3, 1],
                [-0.5, 0.5, 2 / 3, 1],
                [-0.5 * 0.8, 0.5, (2 / 3) * 0.8, 1]
            ],

            // U = 2
            [
                // V = 0..1
                [0.1, -0.5, 0, 1],
                [0.5, -0.5, 2 / 3, 1],
                [0.5, -0.4, 2 / 3, 1],
                [0.5, 0.4, 2 / 3, 1],
                [0.5, 0.5, 2 / 3, 1],
                [0.5 * 0.8, 0.5, (2 / 3) * 0.8, 1]
            ],

            [
                // V = 0..1
                [0.1, -0.5, 0.0, 1],
                [0.5, -0.5, 0.0, 1],
                [0.5, -0.4, 0.0, 1],
                [0.5, 0.4, 0.0, 1],
                [0.5, 0.5, 0.0, 1],
                [0.5 * 0.8, 0.5, 0.0, 1]
            ]
        ];

        const surfaceData = this.builder.build(
            controlPoints,
            3,
            5,
            20,
            20,
            this.jarMaterial
        );
        this.lid = new THREE.CylinderGeometry(0.4, 0.4, 0.1, 20);

        const frontMesh = new THREE.Mesh(surfaceData, this.jarMaterial);
        const backMesh = new THREE.Mesh(surfaceData, this.jarMaterial);
        const lidMesh = new THREE.Mesh(this.lid, this.lidMaterial);

        backMesh.rotateY(Math.PI);
        lidMesh.position.y = 0.55;

        frontMesh.receiveShadow = true;
        backMesh.receiveShadow = true;
        lidMesh.receiveShadow = true;

        this.add(frontMesh);
        this.add(backMesh);
        this.add(lidMesh);
    }
}

export { MyJar };
