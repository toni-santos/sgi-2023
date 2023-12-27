import * as THREE from "three";

class MyLampPost extends THREE.Object3D {
    constructor(app, target, rotation = 0) {
        super();
        this.app = app;
        this.type = "Group";
        this.target = target;
        this.lamp = new THREE.Mesh();

        this.lampPostHeight = 3;
        this.lampPostRadius = 0.05;
        this.lampRadius = 0.5;

        this.lampPole = new THREE.CylinderGeometry(this.lampPostRadius, this.lampPostRadius, this.lampPostHeight, 10, 10);
        this.lampArm = new THREE.CylinderGeometry(this.lampPostRadius, this.lampPostRadius, 0.3, 10, 10);
        this.lampTop = new THREE.CylinderGeometry(this.lampPostRadius, this.lampPostRadius * 2, 0.1, 8, 1, false);

        this.lampPostMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
        this.lampPoleMesh = new THREE.Mesh(this.lampPole, this.lampPostMaterial);
        this.lampArmMesh = new THREE.Mesh(this.lampArm, this.lampPostMaterial);
        this.lampTopMesh = new THREE.Mesh(this.lampTop, this.lampPostMaterial);

        this.lampPoleMesh.position.set(0, this.lampPostHeight / 2, 0);
        this.lampArmMesh.position.set(0.3/2 * 0.9, this.lampPostHeight - this.lampPostRadius, 0);
        this.lampTopMesh.position.set(0.3 - this.lampPostRadius * 0.5, this.lampPostHeight - this.lampPostRadius, 0);
        this.lampArmMesh.rotation.z = Math.PI / 2;

        // This would ideally be a spotlight, but im cane
        this.light = new THREE.PointLight(0x999999, 10, 100);
        this.light.position.set(0.3 + this.lampPostRadius * 0.5, this.lampPostHeight - this.lampPostRadius - 0.1, 0);
        this.light.castShadow = true;

        this.lamp.add(this.lampPoleMesh);
        this.lamp.add(this.lampArmMesh);
        this.lamp.add(this.lampTopMesh);
        this.lamp.add(this.light);
        this.lamp.add(this.lightHelper);

        this.lamp.rotation.y = rotation;

        this.lampTopMesh.castShadow = true;
        this.lampArmMesh.castShadow = true;
        this.lampPoleMesh.castShadow = true;

        this.add(this.lamp);
        
    }
}

export { MyLampPost };