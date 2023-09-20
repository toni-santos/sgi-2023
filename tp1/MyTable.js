import * as THREE from "three";
import { MyApp } from "./MyApp.js";
import { MyPlate } from "./MyPlate.js";
import { MyCake } from "./MyCake.js";
import { arrayMult } from "./MyUtils.js";

/** Chamar o prato com o Bolo como argumento */
class MyTable extends THREE.Object3D {
    /**
     *
     * @param {MyApp} app the application object
     * @param {number} width the width of the table top
     * @param {number} height the height of the table
     * @param {number} topHeight the height of the table top
     * @param {number} depth the depth of the table top
     * @param {number} legsRadius the radius of the table legs
     * @param {number} topColor the color of the table top
     * @param {number} legsColor the color of the table legs
     * @param {THREE.Object3D | undefined} plate the plate object (Optional)
     * @param {THREE.Object3D | undefined} cake the cake object (Optional)
     */
    constructor(
        app,
        width = 6,
        height = 4,
        depth = 3,
        topHeight = 1,
        legsRadius = 0.5,
        topColor = 0xffffff,
        legsColor = 0xffffff,
        plate,
        cake
    ) {
        super();
        this.app = app;
        this.type = "Group";
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.topHeight = topHeight;
        this.legsRadius = legsRadius;
        this.topColor = topColor;
        this.legsColor = legsColor;
        this.legDelta = [
            this.width / 2 - this.legsRadius,
            -this.height / 2,
            this.depth / 2 - this.legsRadius
        ];

        this.topShininess = 2;
        this.legsShininess = 20;
        this.top = new THREE.BoxGeometry(
            this.width,
            this.topHeight,
            this.depth
        );
        this.leg = new THREE.CylinderGeometry(
            this.legsRadius,
            this.legsRadius,
            this.height - 1
        );
        this.plate = plate ?? new MyPlate(this.app, 0.7, 32, 0xffffff);
        this.cake ??= cake;
        this.topMaterial = new THREE.MeshPhongMaterial({
            color: this.topColor,
            specular: "#ffffff",
            emissive: "#000000",
            shininess: this.topShininess,
            side: THREE.DoubleSide
        });
        this.legsMaterial = new THREE.MeshPhongMaterial({
            color: this.legsColor,
            specular: "#555555",
            emissive: "#000000",
            shininess: this.legsShininess
        });
        this.topMesh = new THREE.Mesh(this.top, this.topMaterial);
        this.frLegMesh = this.createLegMesh(
            this.leg,
            this.legsMaterial,
            ...this.legDelta
        );
        this.flLegMesh = this.createLegMesh(
            this.leg,
            this.legsMaterial,
            ...arrayMult(this.legDelta, [-1, 1, 1])
        );
        this.brLegMesh = this.createLegMesh(
            this.leg,
            this.legsMaterial,
            ...arrayMult(this.legDelta, [1, 1, -1])
        );
        this.blLegMesh = this.createLegMesh(
            this.leg,
            this.legsMaterial,
            ...arrayMult(this.legDelta, [-1, 1, -1])
        );

        this.transformMeshes();
        this.addMeshes();
    }

    transformMeshes() {
        this.plate.rotateX(-Math.PI / 2);
        this.plate.position.y = this.topHeight / 1.99;
    }

    addMeshes() {
        this.legMeshes = [
            this.frLegMesh,
            this.flLegMesh,
            this.brLegMesh,
            this.blLegMesh
        ];
        for (const mesh of this.legMeshes) {
            this.topMesh.add(mesh);
        }
        this.topMesh.add(this.plate);
        this.add(this.topMesh);
    }

    createLegMesh(leg, material, dx, dy, dz) {
        this.mesh = new THREE.Mesh(leg, material);
        this.mesh.position.set(dx, dy, dz);
        return this.mesh;
    }
}

MyTable.prototype.isGroup = true;

export { MyTable };
