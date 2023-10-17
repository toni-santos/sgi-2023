import * as THREE from "three";
import { MyApp } from "./MyApp.js";
import { MyCandle } from "./MyCandle.js";

class MyCake extends THREE.Object3D {
    constructor(app, radius, height, segments, color, candles) {
        super();
        this.app = app;
        this.type = "Group";
        this.radius = radius;
        this.height = height;
        this.segments = segments;
        this.color = color;
        this.candles = candles;
        this.cakeShininess = 10;
        this.angle = 2 * Math.PI - Math.PI / 10;
        this.candlesArray = [];

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
        this.cakeFilling = new THREE.CylinderGeometry(
            this.radius * 1.01,
            this.radius * 1.01,
            this.height * 0.1,
            this.segments,
            1,
            false,
            0,
            this.angle
        );

        // Inside of the cake
        this.insidePlaneL = new THREE.PlaneGeometry(
            this.radius,
            this.height,
            1,
            1
        );
        this.insidePlaneR = new THREE.PlaneGeometry(
            this.radius,
            this.height,
            1,
            1
        );

        this.fillingPlaneL = new THREE.PlaneGeometry(
            this.radius * 1.01,
            this.height * 0.1,
            1,
            1
        );
        this.fillingPlaneR = new THREE.PlaneGeometry(
            this.radius * 1.01,
            this.height * 0.1,
            1,
            1
        );

        // Create candles
        let candleAngleDelta = (this.angle - Math.PI / 10) / this.candles;
        let candleAngle = this.angle - candleAngleDelta;

        for (let i = 0; i < this.candles; i++) {
            let candle = new MyCandle(
                this.app,
                this.radius / 25,
                this.radius / 3,
                32,
                0xff0000
            );
            candle.position.x = Math.sin(candleAngle) * (this.radius / 2 + 0.1);
            candle.position.z = Math.cos(candleAngle) * (this.radius / 2 + 0.1);
            candle.position.y = candle.height;
            candle.rotateY(Math.PI / 2 + candleAngle);
            this.add(candle);
            this.candlesArray.push(candle);
            candleAngle -= candleAngleDelta;
        }

        this.cakeMaterial = new THREE.MeshPhongMaterial({
            color: this.color,
            specular: "#80461B",
            emissive: "#80461B",
            emissiveIntensity: 0,
            shininess: 5,
            side: THREE.FrontSide
        });
        this.cakeFillingMaterial = new THREE.MeshPhongMaterial({
            color: 0xf2a999,
            specular: 0xf2a999,
            emissive: 0xf2a999,
            emissiveIntensity: 0,
            shininess: 10,
            side: THREE.FrontSide
        });

        this.cakeMesh = new THREE.Mesh(this.cake, this.cakeMaterial);
        this.cakeMesh.castShadow = true;
        this.cakeMesh.receiveShadow = true;

        this.insidePlaneLMesh = new THREE.Mesh(
            this.insidePlaneL,
            this.cakeMaterial
        );
        this.insidePlaneLMesh.castShadow = true;
        this.insidePlaneLMesh.receiveShadow = true;

        this.insidePlaneRMesh = new THREE.Mesh(
            this.insidePlaneR,
            this.cakeMaterial
        );
        this.insidePlaneRMesh.castShadow = true;
        this.insidePlaneRMesh.receiveShadow = true;

        this.insidePlaneLMesh.position.z =
            Math.cos(this.angle) * (this.radius / 2);
        this.insidePlaneLMesh.position.x =
            Math.sin(this.angle) * (this.radius / 2);
        this.insidePlaneRMesh.position.z = this.radius / 2;
        this.insidePlaneLMesh.rotateY(Math.PI / 2 + this.angle);
        this.insidePlaneRMesh.rotateY(-Math.PI / 2);
        this.cakeMesh.add(this.insidePlaneLMesh);
        this.cakeMesh.add(this.insidePlaneRMesh);

        this.cakeFillingMesh = new THREE.Mesh(
            this.cakeFilling,
            this.cakeFillingMaterial
        );
        this.cakeFillingMesh.castShadow = true;
        this.cakeFillingMesh.receiveShadow = true;

        this.insidePlaneL.height = this.height * 0.1;
        this.insidePlaneR.height = this.height * 0.1;

        this.insideFillingPlaneLMesh = new THREE.Mesh(
            this.fillingPlaneL,
            this.cakeFillingMaterial
        );
        this.insideFillingPlaneLMesh.castShadow = true;
        this.insideFillingPlaneLMesh.receiveShadow = true;

        this.insideFillingPlaneRMesh = new THREE.Mesh(
            this.fillingPlaneR,
            this.cakeFillingMaterial
        );
        this.insideFillingPlaneRMesh.castShadow = true;
        this.insideFillingPlaneRMesh.receiveShadow = true;

        this.insideFillingPlaneLMesh.position.z =
            Math.cos(this.angle) * (this.radius / 2);
        this.insideFillingPlaneLMesh.position.x =
            Math.sin(this.angle) * (this.radius / 2) * 0.999;
        this.insideFillingPlaneRMesh.position.z = this.radius / 2;
        this.insideFillingPlaneRMesh.position.x = -0.001;
        this.insideFillingPlaneLMesh.rotateY(Math.PI / 2 + this.angle);
        this.insideFillingPlaneRMesh.rotateY(-Math.PI / 2);
        this.cakeMesh.add(this.insideFillingPlaneLMesh);
        this.cakeMesh.add(this.insideFillingPlaneRMesh);

        this.add(this.cakeFillingMesh);
        this.add(this.cakeMesh);
    }
}

export { MyCake };
