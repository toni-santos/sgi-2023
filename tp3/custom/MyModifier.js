import * as THREE from "three";
import { MyCollidingObject } from "./MyCollidingObject.js";
import { MyOilSpill } from "./MyOilSpill.js";
import { MyTreeTrunk } from "./MyTreeTrunk.js";
import { MySteeringWheel } from "./MySteeringWheel.js";
import { MyShader } from "./MyShader.js";

class MyModifier extends MyCollidingObject {
    constructor(app, effect, position, duration, isPositive) {
        super(0xff0000);
        this.app = app;
        this.type = 'Group';
        this.duration = duration;
        this.positive = isPositive;
        this.color = this.positive ? 0x00aa00 : 0xaa0000;
        this.modifyingSince = new THREE.Clock();
        this.name = typeof effect === 'number' ? NAMES[effect] : effect;
        this.modifierFunc = EFFECTS[this.name]["function"];

        if (EFFECTS[this.name]["model"] instanceof THREE.Mesh) {
            this.mesh = EFFECTS[this.name]["model"].clone();
            this.texture = EFFECTS[this.name]["texture"];
        } else {
            this.mesh = new THREE.Mesh(EFFECTS[this.name]["model"], new THREE.MeshBasicMaterial({ color: this.color }));
            this.texture = EFFECTS[this.name]["texture"];
        }

        this.shader = new MyShader(this.app, "modifier", "", "shaders/s2.vert", "shaders/s2.frag", {
            "time": { type: 'float', value: 0.0 },
            "offset": { type: 'float', value: 0.01 },
            "uSampler2": { type: 'sampler2D', value: this.texture } 
        });
        this.waitForShaders();

        if (this.name != "Spin") {
            this.mesh.position.set(position.x, 0.35, position.z);
        }

        this.setBoundingBox(this.mesh);
        this.addCollisionMesh(this.mesh);
        this.add(this.mesh);
        this.add(this.collisionMesh);
    }

    waitForShaders() {
        if (this.shader.ready === false) {
            setTimeout(this.waitForShaders.bind(this), 100)
            return;
        }
        this.mesh.material = this.shader.material;
        this.mesh.material.needsUpdate = true;
    }

    update(t) {
        this.shader.updateUniformsValue("time", t);
        this.mesh.material = this.shader.material;
        this.mesh.material.needsUpdate = true;
    }

    apply(obj) {
        obj.loadDefaults();
        obj.modifier = this;
        this.modifyingSince.start();
    }

    static increaseSpeed(obj) {
        return obj.velocity = obj.defaultMaxSpeed;
    }

    static increaseAcceleration(obj) {
        return obj.acceleration = obj.defaultAcceleration * 3;
    }

    static increaseHandling(obj) {
        return obj.handling = obj.defaultHandling * 3;
    }

    static limitSpeed(obj) {
        return obj.velocity = Math.min(obj.velocity, obj.maxSpeed/7);
    }

    static spin(obj) {
        MyModifier.limitSpeed(obj);
        return obj.turn((Math.PI/20 - this.modifyingSince.getElapsedTime() / (10 * this.duration))/obj.defaultHandling, true);
    }
}

const EFFECTS = {};
const NAMES = ["Super Turning", "Max Acceleration", "Speed Limit", "Spin"];
const GEOMETRIES = [new MySteeringWheel().wheel, new THREE.BoxGeometry(0.5, 0.5, 0.5), new MyTreeTrunk().trunk, new MyOilSpill().oilSpill];
const TEXTURES = [
    new THREE.TextureLoader().load("scenes/feupzero/textures/leather/fabric_0030_color_1k.jpg"),
    new THREE.TextureLoader().load("scenes/feupzero/textures/speed.png"),
    new THREE.TextureLoader().load("scenes/feupzero/textures/trunk/Bark_007_BaseColor.jpg"),
    new THREE.TextureLoader().load("scenes/feupzero/textures/oil.jpg"),
];

EFFECTS[NAMES[0]] = {
    "function": MyModifier.increaseHandling,
    "model": GEOMETRIES[0],
    "texture": TEXTURES[0]
};
EFFECTS[NAMES[1]] = {
    "function": MyModifier.increaseAcceleration,
    "model": GEOMETRIES[1],
    "texture": TEXTURES[1]
};
EFFECTS[NAMES[2]] = {
    "function": MyModifier.limitSpeed,
    "model": GEOMETRIES[2],
    "texture": TEXTURES[2]
};
EFFECTS[NAMES[3]] = {
    "function": MyModifier.spin,
    "model": GEOMETRIES[3],
    "texture": TEXTURES[3]
};

export { MyModifier }