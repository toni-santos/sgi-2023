import * as THREE from "three";
import { MyXMLContents } from "./MyXMLContents.js";
import { MyVehicle } from "./custom/MyVehicle.js";
import { MainMenu } from "./custom/MainMenu.js";
import { CarSelection } from "./custom/CarSelection.js";
import { MyEnvironmentPlane } from "./custom/MyEnvironmentPlane.js";
import { EndScreen } from "./custom/EndScreen.js";
import { signedAngleTo } from "./helper/MyUtils.js";
import { MyFirework } from "./custom/MyFirework.js";
import { Options } from "./custom/Options.js";
import { PausedScreen } from "./custom/PausedScreen.js";
import { ObstaclesScreen } from "./custom/ObstaclesScreen.js";
import { MyModifier } from "./custom/MyModifier.js";
import { MyStatusDisplay } from "./custom/MyStatusDisplay.js";
import { MyShaderBillboard } from "./custom/MyShaderBillboard.js";
import { TrackSelection } from "./custom/TrackSelection.js";
import { MyEnvironmentBillboard } from "./custom/MyEnvironmentBillboard.js";

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
        END: 5,
        OPTIONS: 6,
        OBSTACLE: 7
    }

    layers = {
        NONE: 0,
        MENU: 1,
        CAR: 2,
        POWERUP: 3,
        OBSTACLE: 4,
        TRACK_SELECTION: 5
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
        this.playerName = "Player"

        this.bgColor = new THREE.Color(0.612, 0.706, 0.675, 1);
        this.ambColor = new THREE.Color(0.6, 0.6, 0.6, 1);

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
        this.nameInput = document.getElementById("name");

        this.vehicles = [];
        this.playerCar = this.cars[1];
        this.previousPlayerCar = this.cars[1];
        this.opposingCar = this.cars[1];
        this.previousOpposingCar = this.cars[1];

        this.previousObstacle = null;
        this.selectedObstacle = null;

        this.paused = false;
        this.winner = null;
        this.difficulty = 3;
        this.difficultyName = "Normal";
        this.raceClock = new THREE.Clock();
        this.playerTime = 0;
        this.cpuTime = 0;
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
                    this.trackSelectionClickHandler(obj);
                    break;
                case this.state.PLAYING:
                    // this.playingHandler(obj);
                    break;
                case this.state.PAUSED:
                    this.pausedClickHandler(obj);
                    break;
                case this.state.END:
                    this.endClickHandler(obj);
                    break;
                case this.state.OPTIONS:
                    this.optionsClickHandler(obj);
                    break;
                case this.state.OBSTACLE:
                    this.obstacleClickHandler(obj, intersects[0].point);
                    break;
            }
        }
    }

    mainMenuClickHandler(obj) {
        switch(obj.name) {
            case "Start":
                this.moveTo(this.state.TRACK_SELECTION);
                break;
            case "Options":
                this.moveTo(this.state.OPTIONS);
                break;
        }
    }

    trackSelectionClickHandler(obj) {
        switch(obj.name) {
            case "Confirm":
                this.readXML();
                this.moveTo(this.state.CAR_SELECTION);
                break;
            case "Back":
                this.moveTo(this.state.MAIN);
                break;
            default:
                if (this.track)
                    this.clearXML();
                this.trackScreen.previous = this.trackScreen.selected;
                this.trackScreen.selected = obj.name;
                break;
        }               
    }

    obstacleClickHandler(obj, position) {
        switch(obj.name) {
            case "Confirm":
                this.app.setActiveCamera("Menu");
                this.app.updateCameraIfRequired();
                this.app.activeCamera.position.set(this.state.PLAYING * this.OFFSET, 35, 0);
                this.app.controls.target.set(this.state.PLAYING * this.OFFSET, 0, 0);
                break;
            case "Track":
                const pos = new THREE.Vector3(position.x, position.y + 0.35, position.z);
                const obs = new MyModifier(this.app, this.obstaclesScreen.selected.name, pos, 3, false);
                this.collidableObjects.push(obs);
                this.circuit.add(obs);
                this.display();

                // Reset to play state
                this.changePauseState(false);
                this.animationPauseState();
                this.showHUD();
                this.app.followCamera = true;

                this.app.setActiveCamera("Play");
                this.app.updateCameraIfRequired();
                this.currentState = this.state.PLAYING;
                break;
            default:
                this.obstaclesScreen.previous = this.obstaclesScreen.selected;
                this.obstaclesScreen.selected = this.obstaclesScreen.obstacles[obj.name];
                break;
        }
    }

    pausedClickHandler(obj) {
        switch(obj.name) {
            case "Continue":
                this.changePauseState(false);

                this.app.setActiveCamera("Play");
                this.app.updateCameraIfRequired();
                this.showHUD();

                this.currentState = this.state.PLAYING;
                break;
            case "Exit":
                this.changePauseState(false);
                this.moveTo(this.state.MAIN);
                break;
        }
    }

    optionsClickHandler(obj) {
        switch(obj.name) {
            case "Back":
                this.nameInput.style.display = "none";
                this.nameInput.removeEventListener("input", (e) => this.nameChanging(e));
                this.moveTo(this.state.MAIN);
                break;
            case "Easy":
            case "Normal":
            case "Hard":
                this.options.previous = this.options.selected;
                this.options.selected = obj.name;
                this.difficultyName = obj.name;
            case "Easy":
                this.difficulty = 2;
                break;
            case "Normal":
                this.difficulty = 3;
                break;
            case "Hard":
                this.difficulty = 4;
                break;
        }
        console.log(this.difficulty);
    }

    carSelectionClickHandler(obj) {
        switch(obj.name.split("_")[0]) {
            case "player":
                this.previousPlayerCar = this.playerCar;
                this.playerCar = obj.name.split("_")[1];
                this.updateCarDescription("Player".toLowerCase(), this.playerCar);
                break;
            case "cpu":
                this.previousOpposingCar = this.opposingCar;
                this.opposingCar = obj.name.split("_")[1];
                this.updateCarDescription("CPU".toLowerCase(), this.opposingCar);
                break;
            case "Back":
                this.moveTo(this.state.TRACK_SELECTION);
                this.hideCarDescription();
                break;
            case "Confirm":
                if (this.playerCar && this.opposingCar) {
                    this.moveTo(this.state.PLAYING);
                }
                this.hideCarDescription();
                break;
        }
    }

    endClickHandler(obj) {
        this.finalScreen.reset();
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
                    this.trackSelectionHoverHandler(obj, true);
                    break;
                case this.state.PLAYING:
                    break;
                case this.state.PAUSED:
                    this.pausedHoverHandler(obj, true);
                    break;
                case this.state.END:
                    this.endHoverHandler(obj, true);
                    break;
                case this.state.OPTIONS:
                    this.optionsHoverHandler(obj, true);
                    break;
                case this.state.OBSTACLE:
                    this.obstacleHoverHandler(obj, true);
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
                        this.trackSelectionHoverHandler(null, false);
                        break;
                    case this.state.PLAYING:
                        break;
                    case this.state.PAUSED:
                        this.pausedHoverHandler(null, false);
                        break;
                    case this.state.END:
                        this.endHoverHandler(null, false);
                        break;
                    case this.state.OPTIONS:
                        this.optionsHoverHandler(null, false);
                        break;
                    case this.state.OBSTACLE:
                        this.obstacleHoverHandler(null, false);
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

    pausedHoverHandler(obj, isHovering) {
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

    obstacleHoverHandler(obj, isHovering) {
        if (isHovering && (obj.name != "Pick an obstacle" && obj.name != "Track" && obj.name != this.obstaclesScreen.selected.name)) {
            if (this.lastPickedObj != obj) {
                if (this.lastPickedObj)
                    this.lastPickedObj.parent.scale.set(1,1,1);
                this.lastPickedObj = obj;
                this.lastPickedObj.parent.scale.set(1.1,1.1,1.1);
            }
        } else {
            this.lastPickedObj?.parent.scale.set(1,1,1);
            this.lastPickedObj = null;
        }
    }

    optionsHoverHandler(obj, isHovering) {
        if (isHovering && (obj.name != "Options" && obj.name != this.playerName)) {
            if (this.lastPickedObj != obj) {
                if (this.lastPickedObj)
                    this.lastPickedObj.parent.scale.set(1,1,1);
                this.lastPickedObj = obj;
                this.lastPickedObj.parent.scale.set(1.1,1.1,1.1);
            }
        } else {
            if (this.lastPickedObj) {
                this.lastPickedObj.parent.scale.set(1,1,1);
                this.lastPickedObj = null;
            }
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
            if (this.lastPickedObj) {
                this.lastPickedObj.parent.scale.set(1,1,1);
                this.lastPickedObj = null;
            }
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

    trackSelectionHoverHandler(obj, isHovering) {
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

    updateSelectedLayer() {
        switch (this.selectedLayer) {
            case this.layers.NONE:
                this.raycaster.layers.enableAll();
                this.activeLayer = this.selectedLayer;
                break;
            default:
                this.raycaster.layers.set(this.selectedLayer);
                this.activeLayer = this.selectedLayer;
                break;
        }
    }

    /**
     * initializes the contents
     */
    init() {
        this.setupScene();
        this.mainMenu();
        this.selectCar();
        this.endScreen();
        this.optionsMenu();
        this.pauseMenu();
        this.obstaclesMenu();
        this.trackMenu();
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
                this.showCarDescription();
                this.updateCarDescription("cpu", this.playerCar);
                this.updateCarDescription("player", this.opposingCar);

                this.app.setActiveCamera("Menu");
                this.app.updateCameraIfRequired();
                this.app.activeCamera.position.set(this.currentState * this.OFFSET, 7, 5);
                this.app.controls.target.set(this.currentState * this.OFFSET, 0, 0);
                break;
            case this.state.TRACK_SELECTION:
                this.selectedLayer = this.layers.TRACK_SELECTION;
                this.updateSelectedLayer();
                this.currentState = this.state.TRACK_SELECTION;

                this.app.setActiveCamera("Menu");
                this.app.updateCameraIfRequired();
                this.app.activeCamera.position.set(this.currentState * this.OFFSET, 7, 5);
                this.app.controls.target.set(this.currentState * this.OFFSET, 0, 0);
                break;
            case this.state.PLAYING:
                this.playerVehicle = new MyVehicle(this.app, this.playerCar);
                this.playerVehicle.owner = this.playerName;
                const load = this.playerVehicle.loadModel()
                load.finally(() => {
                    this.objects.push(this.playerVehicle);
                    this.display();
                    this.placeVehicle(this.playerVehicle, this.track.points[0]);
                });

                this.cpuVehicle = new MyVehicle(this.app, this.opposingCar);
                this.cpuVehicle.owner = "CPU";
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
                this.vehicles = [this.playerVehicle, this.cpuVehicle];
                this.playGame();
                //TODO: enhance this (timer before start (?))
                break;
            case this.state.END:
                this.selectedLayer = this.layers.MENU;
                this.updateSelectedLayer();
                this.finalScreen.updateResult(this.playerName, this.playerCar, this.opposingCar, this.playerTime, this.cpuTime, this.difficultyName, this.winner);
                this.objects.push(...this.finalScreen.objects.map(obj => {
                    obj.translateX(this.OFFSET * this.state.END);
                    return obj;
                }));
                this.display();
                this.winnerCar = this.winner == this.playerName ? this.finalScreen.playerCar : this.finalScreen.cpuCar;

                this.currentState = this.state.END;
                this.app.setActiveCamera("Menu");
                this.app.updateCameraIfRequired();
                // TODO: change this to a better position
                this.app.activeCamera.position.set(this.currentState * this.OFFSET, 7, 5);
                this.app.controls.target.set(this.currentState * this.OFFSET, 0, 0);

                break;
            case this.state.OPTIONS:
                this.nameInput.style.display = "block";
                this.selectedLayer = this.layers.MENU;
                this.updateSelectedLayer();
                this.nameInput.addEventListener("input", (e) => this.nameChanging(e));

                this.currentState = this.state.OPTIONS;
                this.app.setActiveCamera("Menu");
                this.app.updateCameraIfRequired();
                this.app.activeCamera.position.set(this.currentState * this.OFFSET, 7, 5);
                this.app.controls.target.set(this.currentState * this.OFFSET, 0, 0);
                break;
            case this.state.PAUSED:
                this.selectedLayer = this.layers.MENU;
                this.updateSelectedLayer();
                this.currentState = this.state.PAUSED;

                this.changePauseState(true);
                this.hideHUD();

                this.app.setActiveCamera("Menu");
                this.app.updateCameraIfRequired();
                this.app.activeCamera.position.set(this.currentState * this.OFFSET, 7, 5);
                this.app.controls.target.set(this.currentState * this.OFFSET, 0, 0);
                break;
            case this.state.OBSTACLE:
                this.selectedLayer = this.layers.OBSTACLE;
                this.updateSelectedLayer();
                this.currentState = this.state.OBSTACLE;

                this.changePauseState(true);
                this.hideHUD();
                this.app.followCamera = false;
                this.raycaster.far = 1000;

                this.app.setActiveCamera("Menu");
                this.app.updateCameraIfRequired();
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

    control(delta) {
        if (this.app.pressedKeys.includes("w")) this.playerVehicle.changeVelocity(0.0008 * delta);
        if (this.app.pressedKeys.includes("s")) this.playerVehicle.changeVelocity(-0.0008 * delta);
        if (this.app.pressedKeys.includes("a")) this.playerVehicle.turn(Math.PI * delta / 200);
        if (this.app.pressedKeys.includes("d")) this.playerVehicle.turn(-Math.PI * delta / 200);
        if (this.app.pressedKeys.includes("p")) this.moveTo(this.state.PAUSED);
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
        this.positionAction = this.mixer.clipAction(positionClip)
        this.rotationAction = this.mixer.clipAction(rotationClip)

        // Play both animations
        this.positionAction.play()
        this.rotationAction.play()
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
        switch (this.currentState) {
            case this.state.MAIN:
                // this.updateMain(t);
                break;
            case this.state.OPTIONS:
                this.updateOptions();
            case this.state.CAR_SELECTION:
                this.updateCarSelection(t);
                break;
            case this.state.TRACK_SELECTION:
                this.updateTrackSelection(t);
                break;
            case this.state.PLAYING:
                this.updatePlaying(t, delta);
                break;
            case this.state.PAUSED:
                // this.updatePaused(t);
                break;
            case this.state.END:
                this.updateEnd(t);
                break;
            case this.state.OBSTACLE:
                this.updateObstacle(t);
                break;
        }
    }

    updatePlaying(t, delta) {
        if (this.paused) return;
        for (const vehicle of this.vehicles) {
            vehicle.update(t, delta*50, this.track);
            if (vehicle.completedLaps === this.track.laps && !vehicle.finished) {
                vehicle.finished = true;
                if (this.winner === null) this.winner = vehicle.owner;
                vehicle.owner == this.playerName ? this.playerTime = this.raceClock.getElapsedTime() : this.cpuTime = this.raceClock.getElapsedTime();
            }
        }
        if (this.vehicles.every((v) => v.finished)) return this.endGame();

        for (const obs of this.collidableObjects) {
            if (this.playerVehicle.boundingBox.intersectsBox(obs.boundingBox)) {
                this.collidableObjects = this.collidableObjects.filter((o) => o !== obs);
                this.circuit.remove(obs);
                if (obs.positive) this.moveTo(this.state.OBSTACLE);
                obs.apply(this.playerVehicle);
            }
            if (obs.shader?.ready) {   
                obs.update(t);
            }
        }
        this.mixer?.update(delta*this.difficulty);
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

        for (const billboard of this.billboards)
            billboard.update(t);
        this.informationDisplay.update(this.playerVehicle.completedLaps + 1 + "", this.raceClock.getElapsedTime().toFixed(2), (this.playerVehicle.velocity * 100).toFixed(2), this.playerVehicle.modifier ? (this.playerVehicle.modifier.duration - this.playerVehicle.modifier.modifyingSince.getElapsedTime()).toFixed(2) : "0.00");

        this.updateHUD();
        this.control(delta*50);
    }

    updateHUD() {
        this.hudTime.innerHTML = this.raceClock.getElapsedTime().toFixed(2);
        this.hudSpeed.innerHTML = (this.playerVehicle.velocity * 100).toFixed(2);
        this.hudLap.innerHTML = this.playerVehicle.finished ? "Finish" : `Lap ${this.playerVehicle.completedLaps + 1}/${this.track.laps}`;
        if (this.playerVehicle.modifier)
            this.hudPowerup.innerHTML = `${this.playerVehicle.modifier.name}: ${(this.playerVehicle.modifier.duration -
            this.playerVehicle.modifier.modifyingSince.getElapsedTime()).toFixed(2)}`
        else {this.hudPowerup.innerHTML = ""}
    }

    updateEnd(t) {
        this.winnerCar.rotateY(0.01);
        if(THREE.MathUtils.randInt( 1, 20 ) === 10 ) {
            const firework = new MyFirework(this.app, this.winnerCar.position);
            this.finalScreen.fireworks.push(firework);
            // console.log("firework added")
        }

        // for each fireworks
        for( let i = 0; i < this.finalScreen.fireworks.length; i++ ) {
            // is firework finished?
            if (this.finalScreen.fireworks[i].done) {
                // remove firework
                this.finalScreen.fireworks.splice(i,1)
                // console.log("firework removed")
                continue
            }
            // otherwise upsdate  firework
            this.finalScreen.fireworks[i].update()
        }

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

    changePauseState(value) {
        if (value) {
            this.paused = true;
            this.pauseClock = new THREE.Clock(false);
            this.pauseClock.start();
        } else {
            this.paused = false;
            this.raceClock.elapsedTime -= this.pauseClock.getElapsedTime();
            if (this.playerVehicle.modifier) this.playerVehicle.modifier.modifyingSince.elapsedTime -= this.pauseClock.getElapsedTime();
            this.pauseClock.stop();
        }
        this.animationPauseState();
    }

    animationPauseState() {
        if (this.paused) {
            this.mixer.timeScale = 0;
        } else {
            this.mixer.timeScale = 1;
        };
    }

    endGame() {
        this.hideHUD();
        this.objects = this.objects.filter((o) => o !== this.playerVehicle && o !== this.cpuVehicle);
        this.app.scene.remove(this.playerVehicle);
        this.app.scene.remove(this.cpuVehicle);
        for (const obj of this.collidableObjects) {
            this.circuit.remove(obj);
        }
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

    updateObstacle(t) {
        if (this.obstaclesScreen.previous && (this.obstaclesScreen.previous != this.obstaclesScreen.selected)) {
            this.obstaclesScreen.previous.position.y = 0;
        }
        if (this.obstaclesScreen.selected) {
            this.obstaclesScreen.selected.rotateY(0.05);
            this.obstaclesScreen.selected.position.y = 0.5;
        }
    }

    updateTrackSelection(t) {
        if (this.trackScreen.previous && (this.trackScreen.previous != this.trackScreen.selected)) {
            this.trackScreen.tracks[this.trackScreen.previous].scale.set(1,1,1);
            this.trackScreen.previous = null;
        }
        if (this.trackScreen.selected) {
            this.trackScreen.tracks[this.trackScreen.selected].scale.set(1.2,1.2,1.2);
        }
    }

    updateOptions(t) {
        if (this.options.previous && (this.options.previous != this.options.selected)) {
            this.options.difficulties[this.options.previous].scale.set(1,1,1);
            this.options.previous = null;
        }
        if (this.options.selected) {
            this.options.difficulties[this.options.selected].scale.set(1.2,1.2,1.2);
        }
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

    optionsMenu() {
        this.options = new Options(this.app, this.layers.MENU, this.playerName);
        this.objects.push(...this.options.objects.map(obj => {
            obj.translateX(this.OFFSET * this.state.OPTIONS);
            return obj;
        }));
        this.nameInput.value = this.playerName;
        this.display();
    }

    endScreen() {
        this.finalScreen = new EndScreen(this.app, this.layers.MENU);
        this.objects.push(...this.finalScreen.objects.map(obj => {
            obj.translateX(this.OFFSET * this.state.END);
            return obj;
        }));
        this.display();
    }

    pauseMenu() {
        this.pausedScreen = new PausedScreen(this.app, this.layers.MENU);
        this.objects.push(...this.pausedScreen.objects.map(obj => {
            obj.translateX(this.OFFSET * this.state.PAUSED);
            return obj;
        }));
        this.display();
    }

    obstaclesMenu() {
        this.obstaclesScreen = new ObstaclesScreen(this.app, this.layers.OBSTACLE);
        this.objects.push(...this.obstaclesScreen.objects.map(obj => {
            obj.translateX(this.OFFSET * this.state.OBSTACLE);
            return obj;
        }));
        this.display();
    }

    trackMenu() {
        this.trackScreen = new TrackSelection(this.app, this.layers.TRACK_SELECTION);
        this.objects.push(...this.trackScreen.objects.map(obj => {
            obj.translateX(this.OFFSET * this.state.TRACK_SELECTION);
            return obj;
        }));
        this.display();
    }

    showCarDescription() {
        document.getElementById("playerCar").style.display = "flex";
        document.getElementById("cpuCar").style.display = "flex";
    }

    hideCarDescription() {
        document.getElementById("playerCar").style.display = "none";
        document.getElementById("cpuCar").style.display = "none";
    }

    updateCarDescription(owner, car) {
        let name = document.getElementById(`${owner}CarName`);
        let description = document.getElementById(`${owner}CarDescription`);
        let speed = document.getElementById(`${owner}CarSpeed`);
        let acceleration = document.getElementById(`${owner}CarAcceleration`);
        let handling = document.getElementById(`${owner}CarHandling`);
        let image = document.getElementById(`${owner}CarImage`);
        switch (car) {
            case "ae86":
                name.innerHTML = "Toyota AE86";
                description.innerHTML = "An agile, small, old car. Perfect to deliver tofu!";
                speed.innerHTML = "Speed: ★★★☆☆";
                acceleration.innerHTML = "Acceleration: ★★★☆☆";
                handling.innerHTML = "Handling: ★★★★★";
                image.src = "image/cars/ae86.png";
                break;
            case "lancer":
                name.innerHTML = "Mitsubishi Lancer Evo6";
                description.innerHTML = "Mitsubishi's and Lancer's creation, a slick red dash!";
                speed.innerHTML = "Speed: ★★★★★";
                acceleration.innerHTML = "Acceleration: ★★★★☆";
                handling.innerHTML = "Handling: ★★☆☆☆";
                image.src = "image/cars/lancer.png";
                break;
            case "skyline":
                name.innerHTML = "Nissan Skyline GT-R";
                description.innerHTML = "The classic japanese sport beaut... with a spoiler!";
                speed.innerHTML = "Speed: ★★★★☆";
                acceleration.innerHTML = "Acceleration: ★★★★☆";
                handling.innerHTML = "Handling: ★★★★☆";
                image.src = "image/cars/skyline.png";
                break;
        }
    }

    setupScene() {
        this.app.scene.background = this.bgColor;
        this.app.scene.add(new THREE.AmbientLight(this.ambColor));
    }

    readXML() {
        this.xmlContents = new MyXMLContents(this.app, `scenes/feupzero/${this.trackScreen.selected}.xml`);
        this.circuit = this.xmlContents.reader.objects["circuit"];
        this.track = this.xmlContents.reader.objects["track"];
        this.route = this.xmlContents.reader.objects["route"];
        this.obstacles = this.xmlContents.reader.objects["obstacles"];
        this.powerups = this.xmlContents.reader.objects["powerups"];
        // TODO: Fix placement for these according to the XML
        this.envPlane = new MyEnvironmentPlane(this.app, 200,"scenes/feupzero/textures/m3.jpg", "scenes/feupzero/textures/ground.jpg", "scenes/feupzero/textures/altimetry.png", "shaders/envPlane.vert", "shaders/envPlane.frag");
        this.informationDisplay = new MyStatusDisplay(this.app, "1", "2", "3", "4");
        this.informationDisplay.position.set(-6, 0, 12);
        this.informationDisplay.rotateY(5*Math.PI/6);
        this.shaderBillboard = new MyShaderBillboard(this.app, "scenes/feupzero/textures/okcomp_map.jpg", "scenes/feupzero/textures/okcomp.jpg", "shaders/s1.vert", "shaders/s1.frag");
        this.shaderBillboard.position.set(20, this.shaderBillboard.position.y, 2);
        this.objects.push(this.envPlane, this.informationDisplay, this.shaderBillboard);
        // TODO: Might need to add a timeout here (generation takes time)
        this.generateEnvironment();
        this.display();
        console.log("READ XML: ", this.trackScreen.selected);
    }

    generateEnvironment() {
        this.billboards = [];
        this.backTrees = [];
        const area = 50;
        const spacing = 5;
        const core = 40;

        const trackBox = new THREE.Box3().setFromObject(this.track);

        for (let i = -area; i <= area; i = i + spacing) {
            for (let j = -area; j <= area; j = j + spacing) {    
                let model = "trees";

                const offset = new THREE.Vector2(THREE.MathUtils.randFloat(-spacing, spacing), THREE.MathUtils.randFloat(-spacing, spacing));
                const pos = new THREE.Vector3(i + offset.x, 0, j + offset.y);

                if ( pos.x <= core && pos.x >= -core && pos.z <= core && pos.z >= -core) {
                    model = "tree";
                }
                const tree = new MyEnvironmentBillboard(this.app, pos, model);
                const treeBox = new THREE.Box3().setFromObject(tree);
                if (trackBox.intersectsBox(treeBox)) {
                    continue;
                }
                if (model == "tree") {
                    this.billboards.push(tree);
                } else {
                    tree.lookAt(new THREE.Vector3(0, 0, 0));
                    this.backTrees.push(tree);
                }
            }
        }
        this.objects.push(...this.billboards);
        this.objects.push(...this.backTrees);
    }

    clearXML() {
        this.xmlContents.removeObjects(this.xmlContents.allObjs);
        this.app.scene.remove(this.envPlane);
        this.app.scene.remove(this.informationDisplay);
        this.app.scene.remove(this.shaderBillboard);
        this.billboards.forEach((tree) => this.app.scene.remove(tree));
        this.backTrees.forEach((tree) => this.app.scene.remove(tree));
        this.billboards = [];
        this.backTrees = [];
        this.objects = [];
    }

    playGame() {
        this.app.followCamera = true;
        this.paused = false;
        this.winner = null;
        this.playerTime = 0;
        this.cpuTime = 0;
        this.collidableObjects = this.powerups.concat(this.obstacles);
        for (const obj of this.collidableObjects) {
            this.circuit.add(obj);
        }
        this.display();
    }

    nameChanging(e) {
        if (this.playerName.length >= 7 && e.inputType == 'insertText')
            return;

        this.options.handleNameInput(e);
        this.objects.push(...this.options.objects.map(obj => {
            obj.translateX(this.OFFSET * this.state.OPTIONS);
            return obj;
        }));

        this.playerName = this.options.playerName;
        this.display();
    }
}

export { MyContents };
