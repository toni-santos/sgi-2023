import * as THREE from "three";

class MyReader {
    constructor(app) {
        this.app = app;
        this.type = 'Group';
        this.meshes = [];
        this.trackPoints = null;
        this.routePoints = null;
        this.powerUpPoints = null;
        this.obstaclePoints = null;
    }

    createTrack() {}

    createRoute() {}

    createPowerUps() {}

    createObstacles() {}
}

export {MyReader};