import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MyAxis } from "./MyAxis.js";
import { MyFileReader } from "./parser/MyFileReader.js";
import { MyGraph } from "./helper/MyGraph.js";
import { MyNurbsBuilder } from "./helper/MyNurbsBuilder.js";
import { MySceneData } from "./parser/MySceneData.js";
import { MyXMLContents } from "./MyXMLContents.js";
import { MyTrack } from "./custom/MyTrack.js";
import { MyVehicle } from "./custom/MyVehicle.js";

/**
 *  This class contains the contents of out application
 */
class MyContents {
    /**
       constructs the object
       @param {MyApp} app The application object
    */
    constructor(app) {
        this.app = app;
        this.axis = null;
        this.xmlContents = new MyXMLContents(app);
        this.circuit = this.xmlContents.reader.objects["circuit"];
        this.track = this.xmlContents.reader.objects["track"];
        this.route = this.xmlContents.reader.objects["route"];
        this.obstacles = this.xmlContents.reader.objects["obstacles"];
        this.powerups = this.xmlContents.reader.objects["powerups"];
        this.collidableObjects = this.powerups.concat(this.obstacles);
        this.objects = [];
    }

    /**
     * initializes the contents
     */
    init() {
        // create once
        if (this.axis === null) {
            // create and attach the axis to the scene
            this.axis = new MyAxis(this);
            this.app.scene.add(this.axis);
        }
        this.raceClock = new THREE.Clock();
        this.point = new THREE.Vector3(6, 0, 6);
        this.playerVehicle = new MyVehicle(this.app);
        this.cpuVehicle = new MyVehicle(this.app);
        this.placeVehicle(this.playerVehicle, this.track.points[0]);
        //this.placeVehicle(this.cpuVehicle, this.route.points[0]);
        this.objects.push(this.playerVehicle);
        this.objects.push(this.cpuVehicle);
        this.setupCPUPath(this.cpuVehicle);
        this.display();
        this.raceClock.start();
        //this.app.scene.add(new MyTrack(this.app));
    }

    placeVehicle(vehicle, point) {
        vehicle.position.set(point.x, point.y + 1, point.z);
        const q = new THREE.Quaternion();
        const v = new THREE.Vector3();
        vehicle.getWorldDirection(v);
        q.setFromUnitVectors(v, this.track.curve.getTangent(0));
        const angle = new THREE.Euler();
        angle.setFromQuaternion(q);
        vehicle.setRotation(angle.y);
        vehicle.getWorldDirection(vehicle.orientation);
    }

    control() {
        if (this.app.pressedKeys.includes("w")) this.playerVehicle.changeVelocity(0.0008);
        if (this.app.pressedKeys.includes("s")) this.playerVehicle.changeVelocity(-0.0008);
        if (this.app.pressedKeys.includes("a")) this.playerVehicle.turn(Math.PI/200);
        if (this.app.pressedKeys.includes("d")) this.playerVehicle.turn(-Math.PI/200);
    }

    display() {
        for (const object of this.objects) {
            this.app.scene.add(object);
        }
        this.debugKeyFrames();
    }

    setupCPUPath(cpuVehicle) {
        this.keyPoints = this.route.points;
        let pValues = [];
        for (const point of this.keyPoints) {
            pValues.push(...point);
        }
        const positionKF = new THREE.VectorKeyframeTrack('.position', [...Array(this.keyPoints.length).keys()],
            pValues,
            THREE.InterpolateSmooth  /* THREE.InterpolateLinear (default), THREE.InterpolateDiscrete,*/
        )

        const yAxis = new THREE.Vector3(0, 1, 0);
        const rValues = [];
        let vector = new THREE.Vector3();
        let cross = new THREE.Vector3();

        // Angle in each route point = angle between initial orientation and 
        for (let i = 0; i < this.keyPoints.length; i++) {
            vector = this.keyPoints[(i + 1) % this.keyPoints.length].clone();
            vector.subVectors(vector, this.keyPoints[i]);
            cross.crossVectors(new THREE.Vector3(0, 0, 1), vector);
            let angle = cpuVehicle.orientation.angleTo(vector);
            angle = cross.y < 0 ? -angle : angle;
            console.log(THREE.MathUtils.radToDeg(angle), this.keyPoints[i], vector);
            const q = new THREE.Quaternion().setFromAxisAngle(yAxis, angle);
            rValues.push(...q);
        }

        // Seamless lap
        rValues.splice(-4), rValues.push(...[rValues[0], rValues[1], rValues[2], rValues[3]])

        const quaternionKF = new THREE.QuaternionKeyframeTrack('.quaternion', [...Array(this.keyPoints.length).keys()],
            rValues
        );

        const positionClip = new THREE.AnimationClip('positionAnimation', this.keyPoints.length - 1, [positionKF])
        const rotationClip = new THREE.AnimationClip('rotationAnimation', this.keyPoints.length - 1, [quaternionKF])

        // Create an AnimationMixer
        this.mixer = new THREE.AnimationMixer(cpuVehicle)

        // Create AnimationActions for each clip
        const positionAction = this.mixer.clipAction(positionClip)
        const rotationAction = this.mixer.clipAction(rotationClip)

        // Play both animations
        positionAction.play()
        rotationAction.play()
    }

    debugKeyFrames() {

        let spline = new THREE.CatmullRomCurve3([...this.keyPoints])

        // Setup visual control points

        for (let i = 0; i < this.keyPoints.length; i++) {
            const geometry = new THREE.SphereGeometry(1, 32, 32)
            const material = new THREE.MeshBasicMaterial({ color: 0x0000ff })
            const sphere = new THREE.Mesh(geometry, material)
            sphere.scale.set(0.2, 0.2, 0.2)
            sphere.position.set(... this.keyPoints[i])

            this.app.scene.add(sphere)
        }

        const tubeGeometry = new THREE.TubeGeometry(spline, 100, 0.05, 10, false)
        const tubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 })
        const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial)

        this.app.scene.add(tubeMesh)

    }

    update(t) {
        if (t === undefined) return;
        const delta = this.raceClock.getDelta();
        this.mixer.update(delta*3);
        this.playerVehicle.update(t);
        this.cpuVehicle.update(t);
        this.playerVehicle.computeClosestPoint(this.track.points);
        this.playerVehicle.isOutOfBounds(this.track.points, this.track.width);
        for (const obs of this.collidableObjects) {
            if (this.playerVehicle.boundingBox.intersectsBox(obs.boundingBox)) {
                this.collidableObjects = this.collidableObjects.filter((o) => o !== obs);
                this.circuit.remove(obs);
                obs.apply(this.playerVehicle);
            }
        }
        if (this.playerVehicle.boundingBox.intersectsBox(this.cpuVehicle.boundingBox))
            this.playerVehicle.velocity = Math.min(this.playerVehicle.velocity, this.playerVehicle.maxSpeed/7)
        if (this.app.followCamera) {
            const pos = new THREE.Vector3();
            this.playerVehicle.getWorldPosition(pos);
            this.app.activeCamera.position.copy(pos).add(
                new THREE.Vector3(
                    - 3 * Math.sin(this.playerVehicle.angle), 
                    1, 
                    - 3 * Math.cos(this.playerVehicle.angle)
                    ));
            this.app.controls.target.set(pos.x, pos.y, pos.z);
        }
        //console.log(this.playerVehicle.orientation);
        this.control();
    }
}

export { MyContents };
