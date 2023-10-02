import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { RectAreaLightUniformsLib } from './RectAreaLightUniformsLib.js';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';

/**
 *  This class contains the contents of out application
 */
class MyContents  {

    /**
       constructs the object
       @param {MyApp} app The application object
    */ 
    constructor(app) {
        this.app = app
        this.axis = null

        // box related attributes
        this.boxMesh = null
        this.boxMeshSize = 1.0
        this.boxEnabled = true
        this.lastBoxEnabled = null
        this.boxDisplacement = new THREE.Vector3(0,2,0)

        // plane related attributes
        //texture
        this.planeTexture = new THREE.TextureLoader().load('textures/feup_b.jpg');
        this.boxTexture = new THREE.TextureLoader().load('textures/feup_entry.jpg');
        this.planeTexture.wrapS = THREE.RepeatWrapping;
        this.planeTexture.wrapT = THREE.RepeatWrapping;

        // material
        this.diffusePlaneColor =  "rgb(128,128,128)"
        this.specularPlaneColor = "rgb(0,0,0)"
        this.spotlightColor = 0xffffff
        this.planeShininess = 0

        // relating texture and material:
        // two alternatives with different results
        // alternative 1
        this.planeMaterial = new THREE.MeshPhongMaterial({
            color: this.diffusePlaneColor,
            specular: this.specularPlaneColor,
            emissive: "#000000", shininess: this.planeShininess,
            map: this.planeTexture })

        this.boxMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            specular: 0x000000,
            emissive: "#000000",
            map: this.boxTexture })

        // end of alternative 1

        // alternative 2

//        this.planeMaterial = new THREE.MeshLambertMaterial({
//        map : this.planeTexture });
       // end of alternative 2
    }

    /**
     * builds the box mesh with material assigned
     */
    buildBox() {    
        //let boxMaterial = new THREE.MeshStandardMaterial({ color: "#ffff77", 
        //emissive: "#000000"})

        // Create a Cube Mesh with basic material
        let box = new THREE.BoxGeometry(  this.boxMeshSize,  this.boxMeshSize,  this.boxMeshSize );
        this.boxMesh = new THREE.Mesh( box, this.boxMaterial );
        this.boxMesh.rotation.x = -Math.PI / 2;
        this.boxMesh.position.y = this.boxDisplacement.y;
    }

    /**
     * initializes the contents
     */
    init() {
       
        // create once 
        if (this.axis === null) {
            // create and attach the axis to the scene
            this.axis = new MyAxis(this)
            this.app.scene.add(this.axis)
        }

        // add a point light on top of the model
        /*
        const pointLight = new THREE.PointLight( 0xffffff, 500, 0 );
        pointLight.position.set( 0, 20, 0 );
        this.app.scene.add( pointLight );

        // add a point light helper for the previous point light
        const sphereSize = 0.5;
        const pointLightHelper = new THREE.PointLightHelper( pointLight, sphereSize );
        this.app.scene.add( pointLightHelper );

        // add a directional light
        const light2 = new THREE.DirectionalLight(0xffffff, 1);
        light2.position.set(-5, 10, -2);
        light2.target.position.set(9, 2, 0);
        this.app.scene.add(light2.target);
        this.app.scene.add(light2);

        // add a directional light helper for the previous point light
        const sphereSize = 0.5;
        const light2Helper = new THREE.DirectionalLightHelper(light2, sphereSize);
        this.app.scene.add(light2Helper);
        */

        // add a spotlight on top of the model
        this.light3 = new THREE.SpotLight(this.spotlightColor, 15, 8, Math.PI*2/9, 0, 0);
        this.light3.position.set(2, 5, 1);
        this.light3.target.position.set(1, 0, 1);
        this.app.scene.add(this.light3);
        this.app.scene.add(this.light3.target);

        // add a spotlight helper for the previous point light
        this.light3Helper = new THREE.SpotLightHelper(this.light3, this.spotlightColor);
        this.app.scene.add(this.light3Helper);

        //RectAreaLightUniformsLib.init()
        this.rectAreaLight = new THREE.RectAreaLight(0xffffff, 15);
        this.rectAreaLight.position.set(0, 10, 10)
        this.app.scene.add(this.rectAreaLight);

        // add a rectarealight helper for the previous point light
        this.rectLightHelper = new RectAreaLightHelper(this.rectAreaLight, 0xffffff);
        this.app.scene.add(this.rectLightHelper);

        // add an ambient light
        const ambientLight = new THREE.AmbientLight( 0x555555, 4 );
        this.app.scene.add( ambientLight );
        this.buildBox()
        
        // Create a Plane Mesh with basic material
        let planeSizeU = 10;
        let planeSizeV = 7;
        let planeUVRate = planeSizeV / planeSizeU;
        let planeTextureUVRate = 3354 / 2385; // image dimensions
        let planeTextureRepeatU = 3;
        let planeTextureRepeatV = planeTextureRepeatU * planeUVRate * planeTextureUVRate;
        this.planeTexture.repeat.set(planeTextureRepeatU, planeTextureRepeatV );
        this.planeTexture.rotation = 0;
        this.planeTexture.offset = new THREE.Vector2(0,0);
        let plane = new THREE.PlaneGeometry( planeSizeU, planeSizeV );
        this.planeMesh = new THREE.Mesh( plane, this.planeMaterial );
        this.planeMesh.rotation.x = -Math.PI / 2;
        this.planeMesh.position.y = 0;
        this.app.scene.add( this.planeMesh );
    }
    
    /**
     * updates the diffuse plane color and the material
     * @param {THREE.Color} value 
     */
    updateDiffusePlaneColor(value) {
        this.diffusePlaneColor = value
        this.planeMaterial.color.set(this.diffusePlaneColor)
    }
    /**
     * updates the specular plane color and the material
     * @param {THREE.Color} value 
     */
    updateSpecularPlaneColor(value) {
        this.specularPlaneColor = value
        this.planeMaterial.specular.set(this.specularPlaneColor)
    }
    /**
     * updates the spotlight color
     * @param {THREE.Color} value 
     */
    updateSpotlightColor(value) {
        this.spotlightColor = value;
        this.light3.color.set(this.spotlightColor);
        this.app.scene.remove(this.light3Helper);
        this.light3Helper = new THREE.SpotLightHelper(this.light3, this.spotlightColor);
        this.app.scene.add(this.light3Helper);
    }

    updateSpotlightTargetX(value) {
        this.app.scene.remove(this.light3.target)
        this.light3.target.x = value;
        this.app.scene.add(this.light3.target)
        this.light3Helper.update();
    }

    updateSpotlightTargetY(value) {
        this.app.scene.remove(this.light3.target)
        this.light3.target.y = value;
        this.app.scene.add(this.light3.target)
        this.light3Helper.update();
    }

    updateSpotlightDistance(value) {
        this.light3.distance = value;
        this.light3Helper.update();
    }

    updateSpotlightAngle(value) {
        this.light3.angle = value * (Math.PI/180);
        this.light3Helper.update();
    }

    updateSpotlightPenumbra(value) {
        this.light3.penumbra = value;
        this.light3Helper.update();
    }

    updateSpotlightDecay(value) {
        this.light3.decay = value;
        this.light3Helper.update();
    }
    /**
     * updates the plane shininess and the material
     * @param {number} value 
     */
    updatePlaneShininess(value) {
        this.planeShininess = value
        this.planeMaterial.shininess = this.planeShininess
    }

    updateTextureWrappingS(value) {
        switch (value) {
            case "repeat": this.planeMesh.material.map.wrapS = THREE.RepeatWrapping; break;
            case "mirrored repeat": this.planeMesh.material.map.wrapS = THREE.MirroredRepeatWrapping; break;
            case "clamp to edge": this.planeMesh.material.map.wrapS = THREE.ClampToEdgeWrapping; break;
        }
    }

    updateTextureAngle(value) {
        this.planeMesh.material.map.rotation = value * (Math.PI/180);
    }
    
    /**
     * rebuilds the box mesh if required
     * this method is called from the gui interface
     */
    rebuildBox() {
        // remove boxMesh if exists
        if (this.boxMesh !== undefined && this.boxMesh !== null) {  
            this.app.scene.remove(this.boxMesh)
        }
        this.buildBox();
        this.lastBoxEnabled = null
    }
    
    /**
     * updates the box mesh if required
     * this method is called from the render method of the app
     * updates are trigered by boxEnabled property changes
     */
    updateBoxIfRequired() {
        if (this.boxEnabled !== this.lastBoxEnabled) {
            this.lastBoxEnabled = this.boxEnabled
            if (this.boxEnabled) {
                this.app.scene.add(this.boxMesh)
            }
            else {
                this.app.scene.remove(this.boxMesh)
            }
        }
    }

    /**
     * updates the contents
     * this method is called from the render method of the app
     * 
     */
    update() {
        // check if box mesh needs to be updated
        this.updateBoxIfRequired()

        // sets the box mesh position based on the displacement vector
        this.boxMesh.position.x = this.boxDisplacement.x
        this.boxMesh.position.y = this.boxDisplacement.y
        this.boxMesh.position.z = this.boxDisplacement.z
        
    }

}

export { MyContents };