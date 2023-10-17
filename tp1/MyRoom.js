import * as THREE from "three";
import { MyApp } from "./MyApp.js";
import { MyTable } from "./MyTable.js";
import { MyShelf } from "./MyShelf.js";
import { MyPlate } from "./MyPlate.js";
import { MyCompanionCube } from "./MyCompanionCube.js";
import { MyFrame } from "./MyFrame.js";
import { MyCardboardBox } from "./MyCardboardBox.js";
import { MyWallWindow } from "./MyWallWindow.js";
import { MyCakeLight } from "./MyCakeLight.js";
import { MyCake } from "./MyCake.js";

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
        table
    ) {
        super();
        this.app = app;
        this.type = "Group";
        this.rotationAngle = 0;
        this.rotationHeight = 2;
        this.rotationRadius = 3;

        this.floor = new THREE.PlaneGeometry(floorEdge, floorEdge);
        this.wall = new THREE.PlaneGeometry(floorEdge, wallEdge);
        this.cake = new MyCake(this.app, 0.7, 0.5, 32, 0x80461b, 10);
        this.plate = new MyPlate(
            this.app,
            this.cake.radius,
            32,
            0xffffff,
            this.cake
        );
        this.tableFrame = new MyFrame(
            this,
            2,
            2.5,
            10,
            0x80461b,
            new THREE.TextureLoader().load("textures/cavej.jpg")
        );
        table ??= new MyTable(
            this,
            10,
            5,
            5,
            0.5,
            0.3,
            0x45270a,
            0x595857,
            this.plate,
            this.tableFrame
        );
        this.table = table;
        this.cakeLight = new MyCakeLight(this, this.plate.object);
        this.shelf = new MyShelf(this);
        this.cube = new MyCompanionCube(this, 3);
        this.frame = new MyFrame(
            this,
            2,
            2.5,
            10,
            0x80461b,
            new THREE.TextureLoader().load("textures/cavecarol.jpg")
        );
        this.box = new MyCardboardBox(this, 5, true);
        this.floorShininess = 1;
        this.wallShininess = 2;
        this.floorDelta = floorEdge / 2;
        this.wallDelta = wallEdge / 2;

        this.floorTexture = new THREE.TextureLoader().load(
            "textures/concrete.jpg"
        );
        this.floorTexture.wrapS = THREE.RepeatWrapping;
        this.floorTexture.wrapT = THREE.RepeatWrapping;
        this.floorMaterial = new THREE.MeshPhongMaterial({
            color: floorColor,
            map: this.floorTexture,
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
        this.roofMesh = this.createPlaneMesh(
            this.floor,
            this.floorMaterial,
            [0, 1, 0],
            this.wallDelta
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
        this.frontWallMesh = new MyWallWindow(
            this.app,
            floorEdge,
            wallEdge,
            4,
            0xffffff,
            { right: 0.225, left: 0.225, top: 0.2, bot: 0.2 },
            this
        );
        this.frontWallMesh.translateZ(this.floorDelta);
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
            this.backWallMesh,
            this.roofMesh
        ];

        // this.placeItemsInBox();
        this.transformMeshes();
        this.addMeshes();
        this.addLights();
    }

    addLights() {
        const lightPos = new THREE.Vector3(-10, 10, 0);
        
        this.leftLight = new THREE.SpotLight(0xc6c9f5, 10, 20, Math.PI, 0, 1);
        this.leftLight.position.set(lightPos.x, lightPos.y, lightPos.z);
        this.leftLight.castShadow = true;
        this.add(this.leftLight);
        this.leftLightTarget = new THREE.Object3D();
        this.leftLightTarget.position.set(lightPos.x, 0, lightPos.z);
        this.leftLight.target = this.leftLightTarget;
        this.add(this.leftLightTarget);

        this.rightLight = new THREE.SpotLight(0xc6c9f5, 10, 20, Math.PI, 0, 1);
        this.rightLight.position.set(-lightPos.x, lightPos.y, lightPos.z);
        this.rightLight.castShadow = true;
        this.add(this.rightLight);
        this.rightLightTarget = new THREE.Object3D();
        this.rightLightTarget.position.set(-lightPos.x, 0, lightPos.z);
        this.rightLight.target = this.rightLightTarget;
        this.add(this.rightLightTarget);
    }

    createPlaneMesh(plane, material, normalVector, displacement) {
        const movementVector = normalVector.map(
            (x) => Math.abs(x) * displacement
        );
        const mesh = new THREE.Mesh(plane, material);
        mesh.rotation.set(
            (normalVector[1] * Math.PI) / 2,
            normalVector[0] * (Math.PI / 2) +
                normalVector[2] * (1 - normalVector[2]) * (Math.PI / 2),
            0
        );
        mesh.position.set(...movementVector);
        mesh.receiveShadow = true;
        return mesh;
    }

    transformMeshes() {
        this.shelf.position.z = -this.floorDelta / 2;
        this.shelf.position.y = -this.wallDelta * 0.98;
        this.table.position.set(
            0,
            -this.wallDelta + this.table.height - this.table.topHeight / 2.01,
            0
        );
        this.cube.rotateY(Math.PI / 4);
        this.cube.position.set(
            -10,
            -this.wallDelta + (this.cube.edge * 1.1) / 2,
            0
        );
        this.frame.position.set(
            this.table.width / 2,
            -this.wallDelta + this.frame.height / 2,
            this.table.legDelta[2] +
                this.table.legsRadius +
                (this.frame.height / 2) * Math.sin(Math.PI / 10)
        );
        this.frame.rotateX(-Math.PI / 10);
        this.box.position.set(
            0,
            -this.wallDelta + this.box.wallDelta + 0.01,
            0
        );
        this.positionCakeLight();
    }

    addMeshes() {
        this.add(this.table);
        this.add(this.shelf);
        this.add(this.frame);
        this.add(this.cakeLight);
        this.add(this.cube);
        this.add(this.box);
        for (const mesh of this.meshes) {
            this.add(mesh);
        }
    }

    rotateCakeLight(value) {
        this.rotationAngle = value;
        this.positionCakeLight();
    }

    changeCakeHeight(value) {
        this.rotationHeight = value;
        this.positionCakeLight();
    }

    radiusCakeLight(value) {
        this.rotationRadius = value;
        this.positionCakeLight();
    }

    positionCakeLight() {
        this.cakeLight.position.set(
            this.rotationRadius * Math.cos(this.rotationAngle),
            this.rotationHeight,
            this.rotationRadius * Math.sin(this.rotationAngle)
        );
        this.cakeLight.lookAt(this.plate.position);
    }
}

MyRoom.prototype.isGroup = true;

export { MyRoom };
