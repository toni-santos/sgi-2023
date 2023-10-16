import * as THREE from 'three';

class MyCardboardBox extends THREE.Object3D {
    constructor(app, edge=1) {
        super();
        this.app = app;
        this.type = 'Group';
        this.edge = edge;

        this.floorDelta = this.edge / 2;
        this.wallDelta = 3/2;
        this.material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            map: new THREE.TextureLoader().load('textures/cardboard.png'),
            side: THREE.DoubleSide,
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
            this.backWallMesh,
        ];

        for (const mesh of this.meshes) {
            this.add(mesh);
        }
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
        return mesh;
    }
}

export {MyCardboardBox};