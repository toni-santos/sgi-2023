import * as THREE from "three";
import { MyApp } from "./MyApp.js";
import { MyNurbsBuilder } from "./MyNurbsBuilder.js";

class MyBlueprint extends THREE.Object3D {
    /**
     * 
     * @param {MyApp} app the application object
     * @param {number} height the height of the blueprint (by bending in the middle).
     */
    constructor(app, height = 1.5) {
        super();
        this.app = app;
        this.type = "Group";
        this.builder = new MyNurbsBuilder();

        this.height = height;
        this.material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            map: new THREE.TextureLoader().load("textures/blueprint.png"),
            side: THREE.DoubleSide
        });

        const controlPoints = [
            // U = 0
            [
                // V = 0..1;
                [-1.5, -1.5, this.height, 1],
                [-1.5, 1.5, this.height, 1]
            ],

            // U = 1
            [
                // V = 0..1
                [0, -1.5, 0, 1],
                [0, 1.5, 0, 1]
            ],

            // U = 2
            [
                // V = 0..1
                [1.5, -1.5, this.height, 1],
                [1.5, 1.5, this.height, 1]
            ]
        ];

        const surfaceData = this.builder.build(
            controlPoints,
            2,
            1,
            30,
            30,
            this.material
        );

        const mesh = new THREE.Mesh(surfaceData, this.material);
        mesh.rotateX(Math.PI);
        mesh.receiveShadow = true;
        this.add(mesh);
    }
}

export { MyBlueprint };
