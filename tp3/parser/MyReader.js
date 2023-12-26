import * as THREE from "three";
import { MyTrack } from "../custom/MyTrack.js";
import { MyRoute } from "../custom/MyRoute.js";
import { MyObstacle } from "../custom/MyObstacle.js";
import { MyPowerUp } from "../custom/MyPowerUp.js";

class MyReader {
    constructor(app) {
        this.app = app;
        this.type = 'Group';
        this.meshes = [];
        this.objects = {};
    }

    createTrack(track, width) {
        const points = this.parsePoints(track);
        const trackObj = new MyTrack(this.app, width, points);
        this.objects["track"] = trackObj;
        return trackObj;
    }

    createRoute(route) {
        const points = this.parsePoints(route, [0, 1, 0]);
        const routeObj = new MyRoute(this.app, points);
        this.objects["route"] = routeObj;
        return routeObj;
    }

    createPowerUps(powerups) {
        this.objects["powerups"] = [];   
        const points = this.parsePoints(powerups);
        for (const point of points) {
            const powerupObj = new MyPowerUp(this.app, THREE.MathUtils.randInt(0,1), point, 7);
            this.objects["powerups"].push(powerupObj);
        }
        return this.objects["powerups"];
    }

    createObstacles(obstacles) { 
        this.objects["obstacles"] = [];   
        const points = this.parsePoints(obstacles);
        for (const point of points) {
            const obstacleObj = new MyObstacle(this.app, THREE.MathUtils.randInt(0,1), point, 3);
            this.objects["obstacles"].push(obstacleObj);
        }
        return this.objects["obstacles"];
    }

    parsePoints(pointString, off=[0, 0, 0]) {
        const pointArray = pointString.split(" ");
        if (pointArray.length % 2 != 0) throw SyntaxError("Coordinate number is not even.");
        const points = [];
        for (let i = 0; i < pointArray.length - 1; i=i+2) {
            const point = new THREE.Vector3(parseInt(pointArray[i]) + off[0], 0 + off[1], parseInt(pointArray[i+1]) + off[2]);
            points.push(point);
          }
        return points;
    }
}

export {MyReader};