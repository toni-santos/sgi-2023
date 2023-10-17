import * as THREE from "three";
import { MyBezierPainting } from "./MyBezierPainting.js";
import { MySpring } from "./MySpring.js";
import { MyBlueprint } from "./MyBlueprint.js";
import { MyJar } from "./MyJar.js";
import { MyFlower } from "./MyFlower.js";

class MyCardboardBox extends THREE.Object3D {
    /**
     * 
     * @param {MyApp} app the application object
     * @param {number} edge the edge length of the box
     */
    constructor(app, edge = 1, renderItems) {
        super();
        this.app = app;
        this.type = "Group";
        this.edge = edge;
        this.renderItems = renderItems;

        this.floorDelta = this.edge / 2;
        this.wallDelta = 3 / 2;
        this.material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            map: new THREE.TextureLoader().load("textures/cardboard.png"),
            side: THREE.DoubleSide
        });

        this.floorPlane = new THREE.PlaneGeometry(this.edge, this.edge);
        this.wallPlane = new THREE.PlaneGeometry(this.edge, 3);

        this.floorMesh = this.createPlaneMesh(
            this.floorPlane,
            this.material,
            [0, 1, 0],
            -this.wallDelta
        );
        this.leftWallMesh = this.createPlaneMesh(
            this.wallPlane,
            this.material,
            [1, 0, 0],
            -this.floorDelta
        );
        this.rightWallMesh = this.createPlaneMesh(
            this.wallPlane,
            this.material,
            [-1, 0, 0],
            this.floorDelta
        );
        this.frontWallMesh = this.createPlaneMesh(
            this.wallPlane,
            this.material,
            [0, 0, -1],
            this.floorDelta
        );
        this.backWallMesh = this.createPlaneMesh(
            this.wallPlane,
            this.material,
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

        for (const mesh of this.meshes) {
            this.add(mesh);
        }

        if (this.renderItems) {
            this.bezierPainting = new MyBezierPainting(this, 23, 10, 10, 0xffffff);
            this.spring = new MySpring(this);
            this.blueprint = new MyBlueprint(this);
            this.jar = new MyJar(this);
            this.flower = new MyFlower(this, 2);
    
            this.items = [
                this.bezierPainting,
                this.spring,
                this.blueprint,
                this.jar,
                this.flower
            ];
    
            this.transformItems();
            
            for (const item of this.items) {
                this.add(item);
            }    
        }
    }

    transformItems() {
        // painting
        this.bezierPainting.rotateX(-Math.PI / 8);
        this.bezierPainting.position.set(
            0,
            -this.wallDelta + this.bezierPainting.height / 10 - 0.05,
            -this.floorDelta + 0.39
        );
        this.bezierPainting.scale.set(0.2, 0.2, 0.2);

        // spring
        this.spring.position.set(
            this.floorDelta * 0.7,
            -this.wallDelta,
            this.floorDelta * 0.7
        );

        // blueprint
        this.blueprint.position.set(
            -this.floorDelta * 0.2,
            -this.wallDelta - this.blueprint.height / 2,
            this.floorDelta * 0.4
        );
        this.blueprint.rotateX(Math.PI / 2);

        // jar
        this.jar.position.set(
            this.floorDelta * 0.7,
            -this.wallDelta + 0.51,
            this.floorDelta * 0.2
        );

        //flower
        this.flower.position.set(
            this.floorDelta * 0.5,
            -this.wallDelta * 0.55,
            -this.floorDelta * 0.4
        );
        this.flower.rotateX(Math.PI / 2);
        this.flower.rotateZ(-Math.PI / 2);
        this.flower.rotateY(Math.PI)
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
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    }
}

export { MyCardboardBox };
