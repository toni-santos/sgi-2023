import * as THREE from "three";
import { MyCollidingObject } from "./MyCollidingObject.js";

class MyTreeTrunk extends MyCollidingObject {
    constructor(app, length = 1, radius = 0.25) {
        super(0xff0000);
        this.app = app;
        this.type = 'Group';
        this.material = new THREE.MeshPhongMaterial({
            map: new THREE.TextureLoader().load('scenes/feupzero/textures/trunk/Bark_007_BaseColor.jpg'),
            aoMap: new THREE.TextureLoader().load('scenes/feupzero/textures/trunk/Bark_007_AmbientOcclusion.jpg'),
            bumpMap: new THREE.TextureLoader().load('scenes/feupzero/textures/trunk/Bark_007_Normal.jpg'),
        });
        this.mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 32), this.material);
        this.mesh.position.set(0, radius/2, 0);
        this.mesh.rotateZ(Math.PI / 2);
        this.setBoundingBox(this.mesh);
        this.addCollisionMesh(this.mesh);
        this.add(this.mesh);
        this.add(this.collisionMesh);
    }
}

export { MyTreeTrunk };