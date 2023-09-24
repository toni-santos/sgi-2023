import * as THREE from "three";
import { MyApp } from "./MyApp.js";
import { MyTable } from "./MyTable.js";
import { MyShelf } from "./MyShelf.js";
import { MyPlate } from "./MyPlate.js";
import { MyCompanionCube } from "./MyCompanionCube.js";

class MyRoom extends THREE.Object3D {
    /**
     *
     * @param {MyApp} app the application object
     * @param {number} floorEdge the length of the square floor's side
     * @param {number} wallEdge the height of each wall
     * @param {number} floorColor the hexadecimal representation of the floor color
     * @param {number} wallColor the hexadecimal representation of the walls' color
     * @param {THREE.Object3D} table the table object
     */
    constructor(
        app,
        floorEdge = 10,
        wallEdge = 5,
        floorColor = 0xffffff,
        wallColor = 0xffffff,
        table,
        plate,
        cake
    ) {
        super();
        this.app = app;
        this.type = "Group";

        this.floor = new THREE.PlaneGeometry(floorEdge, floorEdge);
        this.wall = new THREE.PlaneGeometry(floorEdge, wallEdge);
        this.plate = new MyPlate(this.app, 0.7, 32, 0xffffff);
        table ??= new MyTable(
            this,
            10,
            5,
            5,
            1,
            0.5,
            0xaa0000,
            0xbbbbbb,
            this.plate
        );
        this.table = table;
        this.shelf = new MyShelf(this);
        this.cube = new MyCompanionCube(this, 3);

        this.floorShininess = 2;
        this.wallShininess = 2;
        this.floorDelta = floorEdge / 2;
        this.wallDelta = wallEdge / 2;
        this.floorMaterial = new THREE.MeshPhongMaterial({
            color: floorColor,
            specular: "#ffffff",
            emissive: "#000000",
            shininess: this.floorShininess,
            side: THREE.DoubleSide
        });
        this.wallMaterial = new THREE.MeshPhongMaterial({
            color: wallColor,
            specular: "#555555",
            emissive: "#000000",
            shininess: this.wallShininess
        });

        this.floorMesh = this.createPlaneMesh(
            this.floor,
            this.floorMaterial,
            [0, 1, 0],
            -this.wallDelta
        );
        this.leftWallMesh = this.createPlaneMesh(
            this.wall,
            this.wallMaterial,
            [1, 0, 0],
            -this.floorDelta
        );
        this.rightWallMesh = this.createPlaneMesh(
            this.wall,
            this.wallMaterial,
            [-1, 0, 0],
            this.floorDelta
        );
        this.frontWallMesh = this.createPlaneMesh(
            this.wall,
            this.wallMaterial,
            [0, 0, -1],
            this.floorDelta
        );
        this.backWallMesh = this.createPlaneMesh(
            this.wall,
            this.wallMaterial,
            [0, 0, 1],
            -this.floorDelta
        );
        this.meshes = [
            this.floorMesh,
            this.leftWallMesh,
            this.rightWallMesh,
            this.frontWallMesh,
            this.backWallMesh
        ];
        this.transformMeshes();
        this.addMeshes();
    }

    createPlaneMesh(plane, material, normalVector, displacement) {
        this.movementVector = normalVector.map(
            (x) => Math.abs(x) * displacement
        );
        this.mesh = new THREE.Mesh(plane, material);
        this.mesh.rotation.set(
            (normalVector[1] * Math.PI) / 2,
            normalVector[0] * (Math.PI / 2) +
                normalVector[2] * (1 - normalVector[2]) * (Math.PI / 2),
            0
        );
        this.mesh.position.set(...this.movementVector);
        return this.mesh;
    }

    transformMeshes() {
        this.shelf.position.z = -this.floorDelta / 2;
        this.table.position.set(
            0,
            -this.wallDelta + this.table.height - this.table.topHeight / 2.01,
            0
        );
        this.cube.rotateY(Math.PI / 4);
        this.cube.position.set(
            -10,
            -this.wallDelta + this.cube.edge * 1.1 / 2,
            0
        )
    }

    addMeshes() {
        this.add(this.table);
        this.add(this.shelf);
        this.add(this.cube);
        for (const mesh of this.meshes) {
            this.add(mesh);
        }
    }
}

MyRoom.prototype.isGroup = true;

export { MyRoom };
