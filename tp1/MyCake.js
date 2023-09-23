import * as THREE from "three";
import { MyApp } from "./MyApp.js";
import { MyCandle } from "./MyCandle.js";

class MyCake extends THREE.Object3D {
    constructor(app, radius, height, segments, color, candles, object) {
        /** Passar como argumento nº de velas:
         * colocadas circularmente em redor do bolo
         */

        super();
        this.app = app;
        this.type = "Group";
        this.radius = radius;
        this.height = height;
        this.segments = segments;
        this.color = color;
        this.object = object;
        this.candles = candles;
        this.cakeShininess = 10;
        this.angle = Math.PI*2 - Math.PI / 10;

        // Cake
        this.cake = new THREE.CylinderGeometry(
            this.radius,
            this.radius,
            this.height,
            this.segments,
            1,
            false,
            0,
            this.angle
        );

        // Inside of the cake
        this.insidePlaneL = new THREE.PlaneGeometry(this.radius, this.height, 1, 1);
        this.insidePlaneR = new THREE.PlaneGeometry(this.radius, this.height, 1, 1);
        
        // Create candles
        let candleAngleDelta = (this.angle - Math.PI/10) / this.candles;
        let candleAngle = this.angle - candleAngleDelta;

        for (let i = 0; i < this.candles; i++) {
            let candle = new MyCandle(this.app, this.radius/25, this.radius/3, 32, 0xff0000, false);
            candle.position.x = Math.sin(candleAngle) * (this.radius/2 + 0.1);
            candle.position.z = Math.cos(candleAngle) * (this.radius/2 + 0.1);
            candle.position.y = candle.height;
            candle.rotateY(Math.PI / 2 + candleAngle);
            this.add(candle);
            candleAngle -= candleAngleDelta;
        }

        this.cakeMaterial = new THREE.MeshPhongMaterial({
            color: this.color,
            specular: "#80461B",
            emissive: "#80461B",
            emissiveIntensity: 0.3,
            shininess: 20,
            shininess: this.cakeShininess,
            side: THREE.DoubleSide
        });

        this.cakeMesh = new THREE.Mesh(this.cake, this.cakeMaterial);
        this.insidePlaneLMesh = new THREE.Mesh(this.insidePlaneL, this.cakeMaterial);
        this.insidePlaneRMesh = new THREE.Mesh(this.insidePlaneR, this.cakeMaterial);
        this.insidePlaneLMesh.position.z = Math.cos(this.angle) * (this.radius/2);
        this.insidePlaneLMesh.position.x = Math.sin(this.angle) * (this.radius/2);
        this.insidePlaneRMesh.position.z = this.radius/2;
        this.insidePlaneLMesh.rotateY(Math.PI / 2 + this.angle);
        this.insidePlaneRMesh.rotateY(Math.PI / 2);
        this.cakeMesh.add(this.insidePlaneLMesh);
        this.cakeMesh.add(this.insidePlaneRMesh);
        this.add(this.cakeMesh);

    }
}

export { MyCake };
