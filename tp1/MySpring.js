import * as THREE from "three";
import { MyApp } from "./MyApp.js";

class MySpring extends THREE.Object3D {
    constructor(app, height = 1) {
        super();
        this.app = app;

        this.height = height * 100;
        this.points = [];

        for (let i = 0; i <= this.height; i++) {
            this.points.push(new THREE.Vector3(Math.cos(Math.PI*i/10)/2, i/100, Math.sin(Math.PI*i/10)/2));
        }

        this.curve = new THREE.CatmullRomCurve3(this.points);
        this.curveGeometry = new THREE.BufferGeometry().setFromPoints(this.curve.getPoints(this.height));
        this.lineMaterial = new THREE.LineBasicMaterial( { color: 0xffffff } )
        this.lineObj = new THREE.Line( this.curveGeometry, this.lineMaterial )
        this.add( this.lineObj );
    }
}

export { MySpring };