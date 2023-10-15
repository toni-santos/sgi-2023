import * as THREE from "three";
import { MyApp } from "./MyApp.js";
import { MyPersonalityCore } from "./MyPersonalityCore.js";

class MyCakeLight extends THREE.Object3D {
    /**
     *
     * @param {MyApp} app the application object
     * @param {number} radius the radius of the ball
     * @param {number} baseColor the hexadecimal representation of the of the ball base color
     * @param {number} accentColor the hexadecimal representation of the ball accent color
     */
    constructor(app, target) {
        super();
        this.app = app;
        this.type = "Group";
        this.target = target;
        this.rotationAngle = 0;
        this.color = "#ffffff"

        this.light = new THREE.SpotLight(0xffffff, 100);
        this.light.target = this.target;
        this.light.castShadow = true;

        this.personalityCore = new MyPersonalityCore(this.app, 0.5, 10, 0x000000, this.light, this.color);
        this.personalityCore.rotateX(Math.PI/2);

        this.add(this.personalityCore)
    }

    updateColor(value) {
        this.color = value;
        this.light.color.set(this.color);
        this.personalityCore.bulbMaterial.emissive.set(this.color);
        this.personalityCore.bulbMaterial.specular.set(this.color);
    }
}

MyCakeLight.prototype.isGroup = true;

export { MyCakeLight };
