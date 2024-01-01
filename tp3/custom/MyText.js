import * as THREE from "three";

class MyText extends THREE.Object3D {
    constructor(app, text, layer, offset, size = 1) {
        super();
        this.app = app;
        this.text = text;
        this.letterW = 72/2048;
        this.letterH = 90/512;
        this.mesh = new THREE.Mesh()
        this.offset = offset;
        this.layer = layer;
        this.name = text;
        this.size = size;
        this.letterTexture = new THREE.TextureLoader().load(
            "scenes/feupzero/textures/SpriteFont_Arial_Regular_(72)_[1,1,1,1]_72x90.png"
        );
        this.letterTexture.repeat = new THREE.Vector2(this.letterW, this.letterH)
        this.letterMaterial = new THREE.MeshBasicMaterial({transparent: true});
        this.letterMaterial.map = this.letterTexture;
        this.letterGeometry = new THREE.PlaneGeometry(this.size,this.size);

        this.buildText();
    }

    buildText() {
        for (let i = 0; i < this.text.length; i++) {
            const charCode = this.text.charCodeAt(i);
            const charCol = (charCode - 32) % 28;
            const charX = charCol * this.letterW;
            const charRow = charCode >= 32 && charCode <= 59 ? 0 : charCode >= 60 && charCode <= 87 ? 1 : charCode >= 88 && charCode <= 115 ? 2 : 3;  2;
            const charY = 1 - (this.letterH + charRow * this.letterH);

            this.letterTexture.offset = new THREE.Vector2(
                charX, charY
            );

            this.letterMaterial.map = this.letterTexture.clone();
            const letter = new THREE.Mesh(this.letterGeometry, this.letterMaterial.clone());
            letter.position.set(i*this.size, 0, 0);
            letter.rotateX(-Math.PI / 2);
            letter.layers.set(this.layer);
            letter.name = this.text;
            this.add(letter);
        }

        this.position.set(-(this.text.length - 1)/2 + this.offset.x, 0 + this.offset.y, 0 + this.offset.z);
    }

    setText(text) {
        this.text = text;
        this.name = text;
        this.remove(...this.children);
        this.buildText();
    }
    
    // Not working propperly 
    update(text) {
        if (text == this.text) return;

        for (let i = 0; i < text.length; i++) {
            if (this.text[i] && text[i] == this.text[i]) {
                continue;
            }
            const charCode = this.text.charCodeAt(i);
            const charCol = (charCode - 32) % 28;
            const charX = charCol * this.letterW;
            const charRow = charCode >= 32 && charCode <= 59 ? 0 : charCode >= 60 && charCode <= 87 ? 1 : charCode >= 88 && charCode <= 115 ? 2 : 3;  2;
            const charY = 1 - (this.letterH + charRow * this.letterH);

            this.letterTexture.offset = new THREE.Vector2(
                charX, charY
            );
            if (this.children[i]) {
                this.children[i].material.map = this.letterTexture.clone();
                this.children[i].name = text[i];
            } else {
                this.letterMaterial.map = this.letterTexture.clone();
                const letter = new THREE.Mesh(this.letterGeometry, this.letterMaterial.clone());
                letter.position.set(i*this.size, 0, 0);
                letter.rotateX(-Math.PI / 2);
                letter.layers.set(this.layer);
                letter.name = text[i];
                this.add(letter);
            }
        }

        if (text.length < this.text.length) {
            for (let j = text.length; j < this.text.length; j++) {
                this.remove(this.children[j]);
            }
        }

        this.text = text;
        this.name = text;

        this.position.set(-(this.text.length - 1)/2 + this.offset.x, 0 + this.offset.y, 0 + this.offset.z);
    }
}

export { MyText };