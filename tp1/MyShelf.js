import * as THREE from "three";
import { MyApp } from "./MyApp.js";
import { MyTable } from "./MyTable.js";
import { MyPersonalityCore } from "./MyPersonalityCore.js";
import { randomInteger } from "./MyUtils.js";

class MyShelf extends THREE.Object3D {
    /**
     *
     * @param {MyApp} app the application object
     * @param {number} width the width of each shelf section
     * @param {number} height the height of each shelf section
     * @param {number} topHeight the height of each shelf section
     * @param {number} depth the depth of each shelf section
     * @param {number} rows the number of rows on the shelf
     * @param {number} cols the number of columns on the shelf
     */
    constructor(app, rows = 2, cols = 4, width = 10, height = 5, depth = 5) {
        super();
        this.app = app;
        this.type = "Group";
        this.rows = rows;
        this.cols = cols;
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.shelfTopHeight = 0.2;

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                this.section = this.createSection(
                    this.width,
                    this.height,
                    this.depth
                );
                this.section.position.set(this.width * j, this.height * i, 0);
                this.placeBalls();
                this.add(this.section);
            }
        }

        this.position.set(
            -(this.width * (this.cols - 1)) / 2,
            -this.height + this.shelfTopHeight / 2,
            0
        );
    }

    createSection(width, height, depth) {
        const sect = new MyTable(
            this,
            width,
            height,
            depth,
            this.shelfTopHeight,
            0.1,
            0x33447d,
            0x33447d
        );
        sect.rotateX(Math.PI);
        return sect;
    }

    placeBalls() {
        for (let i = 0; i < 3; i++) {
            const value = Math.round(Math.random());
            if (value) {
                const coreLight = new THREE.PointLight(0xe38b27, 1, 100);
                this.core = new MyPersonalityCore(
                    this,
                    1.5,
                    32,
                    0xffffff,
                    coreLight,
                    "#e38b27"
                );
                this.core.position.set(
                    i * this.core.radius * 2 -
                        2 * this.core.radius +
                        Math.random(),
                    -this.core.radius * 1.01,
                    value ? Math.random() : -Math.random()
                );
                this.core.rotateX(Math.PI * Math.random());
                this.core.rotateY(Math.PI * Math.random());
                this.core.rotateZ(Math.PI * Math.random());
                this.section.add(this.core);
            }
        }
    }
}

MyShelf.prototype.isGroup = true;

export { MyShelf };
