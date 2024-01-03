import * as THREE from "three";

class MyRoute extends THREE.Object3D {
    constructor(app, points) {
        super();
        this.app = app;
        this.type = 'Group';
        this.points = new THREE.CatmullRomCurve3(points, true, "catmullrom", 0.2).getPoints(50);
        this.buildRoute();
        this.visible = false;
    }

    buildRoute() {
        for (let i = 0; i < this.points.length; i++) {
            const routePoint = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({color: 0xffff00}));
            routePoint.position.set(this.points[i].x, this.points[i].y, this.points[i].z);
            this.add(routePoint);
        }
    }
}

export {MyRoute};