import * as THREE from "three";

class MyEnvironmentBillboard extends THREE.Object3D {
    constructor(app, pos, model) {
        super();
        this.app = app;
        this.type = 'Group';
        this.pos = pos.clone();
        this.material = new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load(`scenes/feupzero/textures/${model}.png`), transparent: true});
        switch (model) {
            case "tree":
                this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.75), this.material);
                this.position.set(pos.x, pos.y + 2.25 / 2, pos.z);
                break;
            case "trees":
                this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(6 , 5.25), this.material);
                this.position.set(pos.x, pos.y + 5.25 / 2, pos.z);
                break;
        }
        this.add(this.mesh);
    }

    update() {
        this.lookAt(this.app.activeCamera.position);
    }

}

export { MyEnvironmentBillboard };