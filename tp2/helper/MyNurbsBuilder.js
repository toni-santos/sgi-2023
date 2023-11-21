import * as THREE from "three";


import { NURBSSurface } from "three/addons/curves/NURBSSurface.js";

import { ParametricGeometry } from "three/addons/geometries/ParametricGeometry.js";

/**

 *  This class contains the contents of out application

 */

class MyNurbsBuilder {
    /**

       constructs the object

       @param {MyApp} app The application object

    */

    constructor(app) {
        this.app = app;
    }

    build(controlPoints, degree1, degree2, samples1, samples2) {
        const knots1 = [];
        const knots2 = [];


        for (var i = 0; i <= degree1; i++) {
            knots1.push(0);
        }

        for (var i = 0; i <= degree1; i++) {
            knots1.push(1);
        }

        for (var i = 0; i <= degree2; i++) {
            knots2.push(0);
        }

        for (var i = 0; i <= degree2; i++) {
            knots2.push(1);
        }

        let stackedPoints = [];

        for (var i = 0; i < controlPoints.length; i += degree2 + 1) {
            let row = [];
            for (let j = i; j <= i + degree2; j++) {
                row.push(controlPoints[j]);
            }

            let newRow = [];

            for (let k = 0; k < row.length; k++) {
                let item = row[k];
                newRow.push(
                    new THREE.Vector3(
                        item.xx,
                        item.yy,
                        item.zz
                    )
                );
            }

            stackedPoints.push(newRow);
        }

        const nurbsSurface = new NURBSSurface(
            degree1,
            degree2,

            knots1,
            knots2,
            stackedPoints
        );

        const geometry = new ParametricGeometry(
            getSurfacePoint,

            samples1,
            samples2
        );

        return geometry;

        function getSurfacePoint(u, v, target) {
            return nurbsSurface.getPoint(u, v, target);
        }
    }
}

export { MyNurbsBuilder };
