import * as THREE from "three";

class MyText extends THREE.Object3D {
    constructor(app, text, layer, offset) {
        super();
        this.app = app;
        this.text = text;
        this.letterW = 72/2048;
        this.letterH = 90/512;
        this.mesh = new THREE.Mesh()
        this.offset = offset;
        this.layer = layer;
        this.name = text;
        this.buildButton();
    }

    buildButton() {
        for (let i = 0; i < this.text.length; i++) {
            const charCode = this.text.charCodeAt(i);
            const charCol = (charCode - 32) % 28;
            const charX = charCol * this.letterW;
            const charRow = charCode >= 32 && charCode <= 59 ? 0 : charCode >= 60 && charCode <= 87 ? 1 : charCode >= 88 && charCode <= 115 ? 2 : 3;  2;
            const charY = 1 - (this.letterH + charRow * this.letterH);

            const letterGeometry = new THREE.PlaneGeometry(1,1);
            const letterTexture = new THREE.TextureLoader().load(
                "scenes/feupzero/textures/SpriteFont_Arial_Regular_(72)_[1,1,1,1]_72x90.png"
            );
            letterTexture.repeat = new THREE.Vector2(this.letterW, this.letterH)
            letterTexture.offset = new THREE.Vector2(
                charX, charY
            );

            const letterMaterial = new THREE.MeshBasicMaterial({transparent: true});
            letterMaterial.map = letterTexture;
            const letter = new THREE.Mesh(letterGeometry, letterMaterial);
            letter.position.set(i, 0, 0);
            letter.rotateX(-Math.PI / 2);
            letter.layers.set(this.layer);
            letter.name = this.text;
            this.add(letter);
        }

        this.position.set(-(this.text.length - 1)/2 + this.offset.x, 0 + this.offset.y, 0 + this.offset.z);
    }
}

export { MyText };