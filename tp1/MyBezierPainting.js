import * as THREE from "three";
import { MyApp } from "./MyApp.js";
import { MyFrame } from "./MyFrame.js";

class MyBezierPainting extends MyFrame {
    constructor(app, width, height, segments, color) {
        super(app, width, height, segments, color);
        this.drawing = this.drawCurves();
        this.curveGeometry = new THREE.BufferGeometry().setFromPoints( this.drawing.extractPoints(100).shape )
        this.lineMaterial = new THREE.LineBasicMaterial( { color: color } )
        this.lineObj = new THREE.Line( this.curveGeometry, this.lineMaterial )
        this.lineObj.position.set(0, 0, this.depth)
        this.add( this.lineObj );
    }

    drawCurves(x=0, y=0) {
        const shape = new THREE.Shape()
        .moveTo( x - 2.5, y - 4.5)
        .bezierCurveTo(x - 2.5, y - 0.5, x - 8.5, y - 0.5, x - 8.5, y - 4.5)
        .bezierCurveTo(x - 8.5, y - 0.5, x - 4.5, y + 3.5, x - 0.5, y + 3.5)
        .bezierCurveTo(x + 1.5, y + 3.5, x + 3.5, y + 1.5, x + 3.5, y - 0.5)
        .bezierCurveTo(x + 5.5, y - 0.5, x + 7.5, y - 2.5, x + 7.5, y - 4.5)
        .bezierCurveTo(x + 7.5, y - 0.5, x + 1.5, y - 0.5, x + 1.5, y - 4.5)
        return shape
    }

}

MyBezierPainting.prototype.isGroup = true;

export { MyBezierPainting };