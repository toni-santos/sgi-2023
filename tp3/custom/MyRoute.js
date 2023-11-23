import * as THREE from "three";

class MyRoute extends THREE.Object3D {
    constructor(app) {
        super();
        this.app = app;
        this.type = 'Group';
    }
}

export {MyRoute};