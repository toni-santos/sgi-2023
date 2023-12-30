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
import { MainMenu } from "./custom/MainMenu.js";
import { CarSelection } from "./custom/CarSelection.js";
import { MyShader } from "./custom/MyShader.js";
import { MyShaderBillboard } from "./custom/MyShaderBillboard.js";
import { MyEnvironmentPlane } from "./custom/MyEnvironmentPlane.js";
import { EndScreen } from "./custom/EndScreen.js";
import { signedAngleTo } from "./helper/MyUtils.js";

/**
 *  This class contains the contents of out application
 */
class MyContents {
    state = {
        PLAYING: 0,
        CAR_SELECTION: 1,
        TRACK_SELECTION: 2,
        MAIN: 3,
        PAUSED: 4,
        END: 5
    }

    layers = {
        NONE: 0,
        MENU: 1,
        CAR: 2,
        POWERUP: 3,
        OBSTACLE: 4
    }

    cars = ["ae86", "skyline", "lancer"]

    OFFSET = 2000;

    /**
       constructs the object
       @param {MyApp} app The application object
    */
    constructor(app) {
        this.app = app;
        this.axis = null;
        this.objects = [];

        // HUD
        this.hudTime = document.getElementById("time");
        this.hudSpeed = document.getElementById("speed");
        this.hudLap = document.getElementById("lap");
        this.hudPowerup = document.getElementById("powerup");

        // Picking
        this.raycaster = new THREE.Raycaster()
        this.raycaster.near = 1
        this.raycaster.far = 20

        this.pointer = new THREE.Vector2()
        this.intersectedObj = null
        this.pickingColor = "0x00ff00"

        this.activeLayer = this.layers.NONE

        document.addEventListener(
            "pointermove",
            this.onPointerMove.bind(this)
        );

        document.addEventListener(
            "pointerdown",
            this.onPointerDown.bind(this)
        );

        // Menuing
        this.currentState = this.state.MAIN;

        this.playerCar = this.cars[1];
        this.previousPlayerCar = this.cars[1];
        this.opposingCar = this.cars[1];
        this.previousOpposingCar = this.cars[1];
    }

    onPointerDown(event) {
        this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.pointer, this.app.activeCamera);

        var intersects = this.raycaster.intersectObjects(this.app.scene.children);

        if (intersects.length > 0) {
            const obj = intersects[0].object;
            switch(this.currentState) {
                case this.state.MAIN:
                    this.mainMenuClickHandler(obj);
                    break;
                case this.state.CAR_SELECTION:
                    this.carSelectionClickHandler(obj);
                    break;
                case this.state.TRACK_SELECTION:
                    // this.trackSelectionHandler(obj);
                    break;
                case this.state.PLAYING:
                    // this.playingHandler(obj);
                    break;
                case this.state.PAUSED:
                    // this.pausedHandler(obj);
                    break;
                case this.state.END:
                    this.endClickHandler(obj);
                    break;
            }
        }
    }

    mainMenuClickHandler(obj) {
        switch(obj.name) {
            case "Start":
                this.moveTo(this.state.CAR_SELECTION);
                break;
            case "Options":
                break;
        }
    }

    carSelectionClickHandler(obj) {
        switch(obj.name.split("_")[0]) {
            case "player":
                this.previousPlayerCar = this.playerCar;
                this.playerCar = obj.name.split("_")[1];
                break;
            case "cpu":
                this.previousOpposingCar = this.opposingCar;
                this.opposingCar = obj.name.split("_")[1];
                break;
            case "Back":
                this.moveTo(this.state.MAIN);
                break;
            case "Confirm":
                if (this.playerCar && this.opposingCar) {
                    // TODO: track selection
                    this.moveTo(this.state.PLAYING);
                }
                break;
        }
    }

    endClickHandler(obj) {
        switch(obj.name) {
            case "Return":
                this.moveTo(this.state.MAIN);
                break;
            case "Restart":
                this.moveTo(this.state.PLAYING);
                break;
        }
    }
    
    onPointerMove(event) {
        this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.pointer, this.app.activeCamera);

        var intersects = this.raycaster.intersectObjects(this.app.scene.children);

        if (intersects.length > 0) {
            const obj = intersects[0].object;
            switch (this.currentState) {
                case this.state.MAIN:
                    this.mainMenuHoverHandler(obj, true);
                    break;
                case this.state.CAR_SELECTION: 
                    this.carSelectionHoverHandler(obj, true);
                    break;
                case this.state.TRACK_SELECTION:
                    break;
                case this.state.PLAYING:
                    break;
                case this.state.PAUSED:
                    break;
                case this.state.END:
                    this.endHoverHandler(obj, true);
                    break;
            }
        } else {
            if (this.lastPickedObj) {
                switch (this.currentState) {
                    case this.state.MAIN:
                        this.mainMenuHoverHandler(null, false);
                        break;
                    case this.state.CAR_SELECTION:
                        this.carSelectionHoverHandler(null, false);
                        break;
                    case this.state.TRACK_SELECTION:
                        break;
                    case this.state.PLAYING:
                        break;
                    case this.state.PAUSED:
                        break;
                    case this.state.END:
                        this.endHoverHandler(null, false);
                        break;
                }
            }
        }
    }

    mainMenuHoverHandler(obj, isHovering) {
        if (isHovering) {
            if (this.lastPickedObj != obj) {
                if (this.lastPickedObj)
                    this.lastPickedObj.parent.scale.set(1,1,1);
                this.lastPickedObj = obj;
                this.lastPickedObj.parent.scale.set(1.1,1.1,1.1);
            } 
        } else {
            this.lastPickedObj.parent.scale.set(1,1,1);
            this.lastPickedObj = null;
        }
    }

    endHoverHandler(obj, isHovering) {
        if (isHovering && (obj.name == "Return" || obj.name == "Restart")) {
            if (this.lastPickedObj != obj) {
                if (this.lastPickedObj)
                    this.lastPickedObj.parent.scale.set(1,1,1);
                this.lastPickedObj = obj;
                this.lastPickedObj.parent.scale.set(1.1,1.1,1.1);
            } 
        } else {
            this.lastPickedObj.parent.scale.set(1,1,1);
            this.lastPickedObj = null;
        }
    }

    carSelectionHoverHandler(obj, isHovering) {
        if (isHovering) {
            if (this.lastPickedObj != obj) {
                if (this.lastPickedObj)
                    this.lastPickedObj.parent.scale.set(1,1,1);
                this.lastPickedObj = obj;
                if ((this.lastPickedObj.name.split("_")[0] == "player" || this.lastPickedObj.name.split("_")[0] == "cpu") && (this.lastPickedObj.name.split("_")[1] != this.playerCar || this.lastPickedObj.name.split("_")[1] != this.opposingCar))
                    this.lastPickedObj.parent.scale.set(1.1,1.1,1.1);
                if (this.lastPickedObj.name == "Back" || this.lastPickedObj.name == "Confirm")
                    this.lastPickedObj.parent.scale.set(1.1,1.1,1.1);
            } 
        } else {
            this.lastPickedObj.parent.scale.set(1,1,1);
            this.lastPickedObj = null;
        }
    }


    updateSelectedLayer() {
        switch (this.selectedLayer) {
            case this.layers.NONE:
                this.raycaster.layers.enableAll()
                break;
            default:
                this.raycaster.layers.set(this.selectedLayer)
                break;
        }
    }

    /**
     * initializes the contents
     */
    init() {
        this.raceClock = new THREE.Clock();
        this.readXML();
        this.mainMenu();
        this.selectCar();
        this.endScreen();
        // Change this to "PLAYING" to skip the menuing
        this.moveTo(this.state.MAIN);
    }

    moveTo(state) {
        switch (state) {
            case this.state.MAIN:
                this.selectedLayer = this.layers.MENU;
                this.updateSelectedLayer();
                this.currentState = this.state.MAIN;

                this.app.setActiveCamera("Menu");
                this.app.updateCameraIfRequired();
                this.app.activeCamera.position.set(this.currentState * this.OFFSET, 7, 5);
                this.app.controls.target.set(this.currentState * this.OFFSET, 0, 0);
                break;
            case this.state.CAR_SELECTION:
                this.selectedLayer = this.layers.CAR;
                this.updateSelectedLayer();
                this.currentState = this.state.CAR_SELECTION;

                this.app.setActiveCamera("Menu");
                this.app.updateCameraIfRequired();
                this.app.activeCamera.position.set(this.currentState * this.OFFSET, 7, 5);
                this.app.controls.target.set(this.currentState * this.OFFSET, 0, 0);
                break;
            case this.state.TRACK_SELECTION:
                break;
            case this.state.PLAYING:
                this.playerVehicle = new MyVehicle(this.app, this.playerCar);
                const load = this.playerVehicle.loadModel()
                load.finally(() => {
                    this.objects.push(this.playerVehicle);
                    this.display();
                    this.placeVehicle(this.playerVehicle, this.track.points[0]);
                });

                this.cpuVehicle = new MyVehicle(this.app, this.opposingCar);
                const load2 = this.cpuVehicle.loadModel()
                load2.finally(() => {
                    this.objects.push(this.cpuVehicle);
                    this.display();
                    this.setupCPUPath(this.cpuVehicle);

                    this.app.setActiveCamera("Play");
                    this.app.updateCameraIfRequired();
                    this.showHUD();
                    this.currentState = this.state.PLAYING;

                    this.raceClock.start();
                });
                this.playGame();
                //TODO: enhance this (timer before start (?)) 
                break;
            case this.state.END:
                this.selectedLayer = this.layers.MENU;
                this.updateSelectedLayer();
                this.currentState = this.state.END;

                this.finalScreen.updateResult("WOW", this.raceClock.getElapsedTime());
                this.objects.push(...this.finalScreen.objects.map(obj => {
                    obj.translateX(this.OFFSET * this.state.END);
                    return obj;
                }));
                this.display();
        
                this.app.setActiveCamera("Menu");
                this.app.updateCameraIfRequired();
                // TODO: change this to a better position
                this.app.activeCamera.position.set(this.currentState * this.OFFSET, 7, 5);
                this.app.controls.target.set(this.currentState * this.OFFSET, 0, 0);

                break;
        }
    }

    placeVehicle(vehicle, point) {
        vehicle.position.set(point.x, point.y + 0.01, point.z);
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
        this.objects = [];
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

        // Angle in each route point = angle between current orientation vector and direction vector to next point
        for (let i = 0; i < this.keyPoints.length; i++) {
            vector = this.keyPoints[(i + 1) % this.keyPoints.length].clone();
            vector.subVectors(vector, this.keyPoints[i]);
            const angle = signedAngleTo(cpuVehicle.orientation, vector);
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
        this.mixer?.update(delta*3);
        switch (this.currentState) {
            case this.state.MAIN:
                // this.updateMain(t);
                break;
            case this.state.CAR_SELECTION:
                this.updateCarSelection(t);
                break;
            case this.state.TRACK_SELECTION:
                // this.updateTrackSelection(t);
                break;
            case this.state.PLAYING:
                this.updatePlaying(t);
                break;
            case this.state.PAUSED:
                // this.updatePaused(t);
                break;
            case this.state.END:
                // this.updateEnd(t);
                break;
        }
    }

    updatePlaying(t) {
        this.playerVehicle.update(t, this.track);
        this.cpuVehicle.update(t, this.track);
        if (this.playerVehicle.completedLaps === this.track.laps) return this.endGame();
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
        this.updateHUD();
        this.control();
    }

    updateHUD() {
        this.hudTime.innerHTML = this.raceClock.getElapsedTime().toFixed(2);
        this.hudSpeed.innerHTML = (this.playerVehicle.velocity * 100).toFixed(2);
        this.hudLap.innerHTML = `Lap ${this.playerVehicle.completedLaps + 1}/${this.track.laps}`;
        if (this.playerVehicle.modifier)
            this.hudPowerup.innerHTML = `Modifier timer: ${(this.playerVehicle.modifier.duration - 
            this.playerVehicle.modifier.modifyingSince.getElapsedTime()).toFixed(2)}`
        else {this.hudPowerup.innerHTML = ""}
    }

    showHUD() {
        this.hudTime.style.display = "block";
        this.hudSpeed.style.display = "block";
        this.hudLap.style.display = "block";
        this.hudPowerup.style.display = "block";
    }

    hideHUD() {
        this.hudTime.style.display = "none";
        this.hudSpeed.style.display = "none";
        this.hudLap.style.display = "none";
        this.hudPowerup.style.display = "none";
    }

    endGame() {
        this.hideHUD();
        this.objects = this.objects.filter((o) => o !== this.playerVehicle && o !== this.cpuVehicle);
        this.app.scene.remove(this.playerVehicle);
        this.app.scene.remove(this.cpuVehicle);
        return this.moveTo(this.state.END);
    }

    updateCarSelection(t) {
        if (this.previousPlayerCar != this.playerCar) {
            this.carSelection.map["player_" + this.previousPlayerCar].position.y = 0;
            this.carSelection.map["player_" + this.previousPlayerCar].setRotationFromAxisAngle(new THREE.Vector3(0,1,0), 0);
        }

        if (this.previousOpposingCar != this.opposingCar) {
            this.carSelection.map["cpu_" + this.previousOpposingCar].position.y = 0;
            this.carSelection.map["cpu_" + this.previousOpposingCar].setRotationFromAxisAngle(new THREE.Vector3(0,1,0), 0);
        }

        this.carSelection.map["player_" + this.playerCar].position.y = 2;
        this.carSelection.map["player_" + this.playerCar].rotateY(0.01);
        this.carSelection.map["cpu_" + this.opposingCar].position.y = 2;
        this.carSelection.map["cpu_" + this.opposingCar].rotateY(0.01);
    }

    mainMenu() {
        this.mainmenu = new MainMenu(this.app, this.layers.MENU);

        this.objects.push(...this.mainmenu.objects.map(obj => {
            obj.translateX(this.OFFSET * this.state.MAIN)
            return obj;
        }));
        this.display();
    }

    selectCar() {
        this.carSelection = new CarSelection(this.app, this.layers.CAR, this.cars);
        this.objects.push(...this.carSelection.objects.map(obj => {
            obj.translateX(this.OFFSET * this.state.CAR_SELECTION)
            return obj;
        }));
        this.display();
    }

    endScreen() {
        this.finalScreen = new EndScreen(this.app, this.layers.MENU);
        this.objects.push(...this.finalScreen.objects.map(obj => {
            obj.translateX(this.OFFSET * this.state.END);
            console.log(obj.position.x);
            return obj;
        }));
        this.display();
    }

    readXML() {
        this.xmlContents = new MyXMLContents(this.app);
        this.circuit = this.xmlContents.reader.objects["circuit"];
        this.track = this.xmlContents.reader.objects["track"];
        this.route = this.xmlContents.reader.objects["route"];
        this.obstacles = this.xmlContents.reader.objects["obstacles"];
        this.powerups = this.xmlContents.reader.objects["powerups"];
        this.collidableObjects = this.powerups.concat(this.obstacles);
        // TODO: remove this, it's just a placeholder for testing
        this.envPlane = new MyEnvironmentPlane(this.app, 200,"scenes/feupzero/textures/envMap.jpg", "scenes/feupzero/textures/ground.jpg", "shaders/s1.vert", "shaders/s1.frag");
        this.objects.push(this.envPlane);
    }

    playGame() {
        this.app.followCamera = true;
        this.display();
    }
}

export { MyContents };
