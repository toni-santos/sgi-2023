import * as THREE from "three";
import { MyApp } from "./MyApp.js";
import { MyNurbsBuilder } from "./MyNurbsBuilder.js";

class MyBlueprint extends THREE.Object3D {
    constructor(app) {
        super();
        this.app = app;
        this.type = "Group";
        this.builder = new MyNurbsBuilder();
        this.material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            map: new THREE.TextureLoader().load('textures/blueprint.png'),
            side: THREE.DoubleSide
        })

        const controlPoints =
        [   // U = 0
            [ // V = 0..1;
                [ -1.5, -1.5, 0.0, 1 ],
                [ -1.5,  1.5, 0.0, 1 ]
            ],

        // U = 1
            [ // V = 0..1
                [ 0, -1.5, 1.5, 1 ],
                [ 0,  1.5, 1.5, 1 ]
            ],
    
        // U = 2    
            [ // V = 0..1
                [ 1.5, -1.5, 0.0, 1 ],
                [ 1.5,  1.5, 0.0, 1 ]
            ]
        ]
        
        const surfaceData = this.builder.build(controlPoints,
                      2, 1, 30,
                      30, this.material)  
        
        const mesh = new THREE.Mesh( surfaceData, this.material );
        this.add( mesh )
    }

}

export {MyBlueprint};