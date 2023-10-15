import * as THREE from "three";
import { MyApp } from "./MyApp.js";
import { MyAxis } from "./MyAxis.js";
import { arrayMult } from "./MyUtils.js";

class MyCompanionCube extends THREE.Object3D {
    /**
     *
     * @param {MyApp} app the application object
     * @param {number} radius the radius of the ball
     * @param {number} baseColor the hexadecimal representation of the of the ball base color
     * @param {number} accentColor the hexadecimal representation of the ball accent color
     */
    constructor(app, edge=5, heartColor=0xff88ff) {
        super();
        this.app = app;
        this.type = "Group";
        this.edge = edge;
        this.heartColor = heartColor;
        this.baseColor = 0x555555;
        this.accentColor = 0xdddddd;
        this.accentMaterial = new THREE.MeshPhongMaterial({shininess: 100, color: this.accentColor, side: THREE.FrontSide})
        this.heartMaterial = new THREE.MeshPhongMaterial({color: this.heartColor, side: THREE.FrontSide});

        this.cube = new THREE.BoxGeometry(this.edge, this.edge, this.edge);

        this.cubeMesh = new THREE.Mesh(
            this.cube,
            new THREE.MeshPhongMaterial({ color: 0x555555, side: THREE.FrontSide })
        );
        this.cubeMesh.castShadow = true;
        this.cubeMesh.receiveShadow = true;

        this.extrudeSettings = { depth: 0.05, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 0.3, bevelThickness: 0.1 * this.edge / 4 };
        this.addHeartSlots();
        this.addCornerArmor();
        this.addEdgeArmor();
        this.add(this.cubeMesh);
    }

    addHeartSlots() {
        const circleSlot = new THREE.CylinderGeometry(this.edge / 4, this.edge / 4, this.edge * 1.05);
        const slotMesh = new THREE.Mesh(
            circleSlot,
            this.accentMaterial
        );
        slotMesh.castShadow=true;
        slotMesh.receiveShadow=true;
        // Top / Bottom
        this.addSlot(slotMesh);
        // Front / Back
        this.addSlot(slotMesh.clone(), slotMesh.rotateX.bind(slotMesh));
        // Right / Left
        this.addSlot(slotMesh.clone(), slotMesh.rotateZ.bind(slotMesh));
    }

    addSlot(slot, rotate) {
        this.addLines(slot);

        if (rotate) rotate(Math.PI/2);

        this.positionHeart(1, slot);
        this.positionHeart(-1, slot);
        
        this.add(slot);
    }

    addLines(slot) {
        const lineHole = new THREE.CylinderGeometry(this.edge / 70, this.edge / 70, this.edge, 4);
        let lineMesh = new THREE.Mesh(
            lineHole,
            this.heartMaterial
        );
        lineMesh.castShadow = true;
        lineMesh.receiveShadow = true;

        this.addLinePair(lineMesh, slot, [1, 1, 0]);
        this.addLinePair(lineMesh.clone(), slot, [1, 0, 1]);

    }

    addLinePair(line, slot, rotationVector) {
        line.rotation.set(...arrayMult(new Array(3).fill(Math.PI / 2), rotationVector));
        line.position.y = this.edge / 2;
        slot.add(line);

        line = line.clone();
        line.position.y = -this.edge / 2;
        slot.add(line);
    }

    addCornerArmor() {
        //+Y +X +Z
        this.positionCorner(false, -1, 1, ...[1, 1, 1]);
        //+Y +X -Z
        this.positionCorner(true, -1, -1, ...[1, 1, -1]);
        //+Y -X +Z
        this.positionCorner(false, -1, -1, ...[-1, 1, 1]);
        //+Y -X -Z
        this.positionCorner(true, -1, 1, ...[-1, 1, -1]);
        //-Y +X +Z
        this.positionCorner(true, 1, -1, ...[1, -1, 1]);
        //-Y +X -Z
        this.positionCorner(false, 1, 1, ...[1, -1, -1]);
        //-Y -X +Z
        this.positionCorner(true, 1, 1, ...[-1, -1, 1]);
        //-Y -X -Z
        this.positionCorner(false, 1, -1, ...[-1, -1, -1]);
    }

    addEdgeArmor() {
        const values = [-1, 0, 1];
        for (const x of values) {
            for (const y of values) {
              for (const z of values) {
                if ([x, y, z].filter((e) => e === 0).length === 1) {
                  this.positionBar([x, y, z]);
                }
              }
            }
        }
    }

    positionBar(delta) {
        const zeroIndex = delta.indexOf(0);
        const boxSize = new Array(3).fill(this.edge / 12);
        boxSize[zeroIndex] = boxSize[zeroIndex] * 3;

        const armor = new THREE.BoxGeometry(...boxSize);
        const armorMesh = new THREE.Mesh(armor, this.accentMaterial);
        armorMesh.castShadow = true;
        armorMesh.receiveShadow = true;

        armorMesh.position.set(...arrayMult(delta, Array(3).fill(this.edge / 2)));

        this.add(armorMesh);
    }

    positionCorner(isZRotation, xSign, yzSign, dx, dy, dz) {
        const corner = new THREE.CylinderGeometry(this.edge / 10, Math.sqrt(2) * this.edge / 5, this.edge / 5, 3);
        this.cornerMesh = new THREE.Mesh(corner, this.accentMaterial);
        this.cornerMesh.castShadow = true;
        this.cornerMesh.receiveShadow = true;
        this.cornerMesh.rotateX(xSign * Math.PI / 2 + Math.PI / 2);

        if (isZRotation) {
            this.cornerMesh.rotateZ(yzSign * Math.PI / 4);
            this.cornerMesh.rotateX(-Math.PI / 5)
        } 
        else {
            this.cornerMesh.rotateY(yzSign * Math.PI / 4);
            this.cornerMesh.rotateX(Math.PI / 3.2) 
        }

        this.cornerMesh.position.set(dx * this.edge/2.2, dy * this.edge/2.2, dz * this.edge/2.2);
        this.add(this.cornerMesh);
    }

    positionHeart(sign, slot) {
        const heart = this.drawHeart(-25, -40);
        heart.castShadow = true;
        heart.receiveShadow = true;

        heart.scale.set(this.edge/300, this.edge/300);
        heart.rotateX(Math.PI / 2);
        heart.position.y = (sign * this.edge + this.extrudeSettings.depth) / 2;
        slot.add(heart);
    }

    drawHeart(x=0, y=0) {
        /**
         * From https://github.com/mrdoob/three.js/blob/master/examples/webgl_geometry_shapes.html
         */
        const heartLine = new THREE.Shape()
        .moveTo( x + 25, y + 25 )
        .bezierCurveTo( x + 25, y + 25, x + 20, y, x, y )
        .bezierCurveTo( x - 30, y, x - 30, y + 35, x - 30, y + 35 )
        .bezierCurveTo( x - 30, y + 55, x - 10, y + 77, x + 25, y + 95 )
        .bezierCurveTo( x + 60, y + 77, x + 80, y + 55, x + 80, y + 35 )
        .bezierCurveTo( x + 80, y + 35, x + 80, y, x + 50, y )
        .bezierCurveTo( x + 35, y, x + 25, y + 25, x + 25, y + 25 );

        const heart = new THREE.ExtrudeGeometry(heartLine, this.extrudeSettings);
        return new THREE.Mesh(heart, this.heartMaterial);
    }
}

MyCompanionCube.prototype.isGroup = true;

export { MyCompanionCube };
