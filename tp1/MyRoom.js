import * as THREE from "three";
import { MyApp } from "./MyApp.js";
import { MyTable } from "./MyTable.js";
import { MyShelf } from "./MyShelf.js";
import { MyPlate } from "./MyPlate.js";
import { MyCompanionCube } from "./MyCompanionCube.js";
import { MyFrame } from "./MyFrame.js";
import { MyBezierPainting } from "./MyBezierPainting.js";
import { MySpring } from "./MySpring.js";
import { MyBlueprint } from "./MyBlueprint.js";
import { MyJar } from "./MyJar.js";
import { MyFlower } from "./MyFlower.js";
import { MyCardboardBox } from "./MyCardboardBox.js";
import { MyWallWindow } from "./MyWallWindow.js";
import { MyCakeLight } from "./MyCakeLight.js";

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
        this.rotationAngle = 0;
        this.rotationHeight = 2;
        this.rotationRadius = 3;

        this.floor = new THREE.PlaneGeometry(floorEdge, floorEdge);
        this.wall = new THREE.PlaneGeometry(floorEdge, wallEdge);
        this.plate = new MyPlate(this.app, 0.7, 32, 0xffffff);
        this.tableFrame = new MyFrame(this, 2, 2.5, 10, 0x80461B, new THREE.TextureLoader().load('textures/cavej.jpg'));
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
        this.cakeLight = new MyCakeLight(this, this.plate.cake);
        this.shelf = new MyShelf(this);
        this.cube = new MyCompanionCube(this, 3);
        this.frame = new MyFrame(this, 2, 2.5, 10, 0x80461B, new THREE.TextureLoader().load('textures/cavecarol.jpg'));
        this.bezierPainting = new MyBezierPainting(this, 23, 10, 10, 0xffffff);
        this.spring = new MySpring(this);
        this.blueprint = new MyBlueprint(this);
        this.jar = new MyJar(this);
        this.flower = new MyFlower(this, 3);
        this.box = new MyCardboardBox(this, 5);
        this.floorShininess = 1;
        this.wallShininess = 2;
        this.floorDelta = floorEdge / 2;
        this.wallDelta = wallEdge / 2;

        this.floorTexture = new THREE.TextureLoader().load('textures/concrete.jpg');
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
            {right: 0.225, left: 0.225, top: 0.2, bot: 0.2},
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
        this.items = [
            this.bezierPainting,
            this.spring,
            this.blueprint,
            this.jar,
            this.flower
        ];
        for (const item of this.items) {
            this.box.add(item);
        }

        this.placeItemsInBox();
        this.transformMeshes();
        this.addMeshes();
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
        mesh.receiveShadow = True;
        return mesh;
    }

    placeItemsInBox() {
        // painting
        this.bezierPainting.rotateX(-Math.PI/8);
        this.bezierPainting.position.set(0, -this.box.wallDelta + this.bezierPainting.height/10 - 0.05, -this.box.floorDelta + 0.39 );

        // spring
        this.spring.position.set(this.box.floorDelta * 0.7, -this.box.wallDelta, this.box.floorDelta * 0.7);

        // blueprint
        this.blueprint.position.set(-this.box.floorDelta * 0.2, -this.box.wallDelta - this.blueprint.height/2, this.box.floorDelta * 0.4);

        // jar
        this.jar.position.set(this.box.floorDelta * 0.7, -this.box.wallDelta + 0.51, this.box.floorDelta * 0.2);

        //flower
        this.flower.position.set(this.box.floorDelta * 0.5, -this.box.wallDelta + this.flower.stemHeight, -this.box.floorDelta * 0.4);
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
            -this.wallDelta + this.cube.edge * 1.1 / 2,
            0
        );
        this.frame.position.set(this.table.width / 2, -this.wallDelta + this.frame.height/2, this.table.legDelta[2] + this.table.legsRadius + this.frame.height/2 * Math.sin(Math.PI/10));
        this.frame.rotateX(-Math.PI/10);
        this.bezierPainting.scale.set(0.2, 0.2, 0.2);
        this.blueprint.rotateX(Math.PI/2);
        this.box.position.set(0, -this.wallDelta + this.box.wallDelta + 0.01, 0);
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

    rotateCakeLight(value){
        this.rotationAngle = value;
        this.positionCakeLight();
    }

    changeCakeHeight(value){
        this.rotationHeight = value;
        this.positionCakeLight();
    }
    
    radiusCakeLight(value){
        this.rotationRadius = value;
        this.positionCakeLight();
    }

    positionCakeLight() {
        this.cakeLight.position.set(this.rotationRadius*Math.cos(this.rotationAngle), this.rotationHeight, this.rotationRadius*Math.sin(this.rotationAngle));
        this.cakeLight.lookAt(this.plate.position);
    }

}

MyRoom.prototype.isGroup = true;

export { MyRoom };
