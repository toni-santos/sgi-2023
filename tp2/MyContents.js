import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { MyFileReader } from './parser/MyFileReader.js';
import { MyGraph } from './MyGraph.js';
import { MyNurbsBuilder } from './helper/MyNurbsBuilder.js';

/**
 *  This class contains the contents of out application
 */
class MyContents  {
    /*
        TODO:
            - mapear os nomes das primitivas às instancias de tjs (agora só há BoxGeometries)
            - aplicar transformações
            - aplicar materiais
    */

    /**
       constructs the object
       @param {MyApp} app The application object
    */ 
    constructor(app) {
        this.app = app
        this.axis = null
        this.cameras = [];
        this.textures = [];
        this.materials = [];
        this.objects = [];
        this.sceneGraph = null;
        this.meshes = {};
        this.mat = new THREE.MeshPhongMaterial({color: 0x00ff00});

        this.objectMap = {
            cylinder: THREE.CylinderGeometry,
            rectangle: THREE.PlaneGeometry,
            triangle: THREE.Triangle,
            sphere: THREE.SphereGeometry,
            nurbs: 'wip',
            box: THREE.BoxGeometry,
            model3d: 'wip',
            skybox: 'wip',
        }

        this.reader = new MyFileReader(app, this, this.onSceneLoaded);
		this.reader.open("scenes/demo/demo.xml");
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
    }

    /**
     * Called when the scene xml file load is complete
     * @param {MySceneData} data the entire scene data object
     */
    onSceneLoaded(data) {
        console.info("scene data loaded " + data + ". visit MySceneData javascript class to check contents for each data item.")
        this.onAfterSceneLoadedAndBeforeRender(data);
        this.render(data);
    }

    output(obj, indent = 0) {
        console.log("" + new Array(indent * 4).join(' ') + " - " + obj.type + " " + (obj.id !== undefined ? "'" + obj.id + "'" : ""))
    }

    onAfterSceneLoadedAndBeforeRender(data) {
       
        // refer to descriptors in class MySceneData.js
        // to see the data structure for each item

        this.output(data.options)
        console.log("textures:")
        for (var key in data.textures) {
            let texture = data.textures[key]
            this.output(texture, 1)
        }

        console.log("materials:")
        for (var key in data.materials) {
            let material = data.materials[key]
            this.output(material, 1)
        }

        console.log("cameras:")
        for (var key in data.cameras) {
            let camera = data.cameras[key]
            this.output(camera, 1)
        }

        console.log("nodes:")
        for (var key in data.nodes) {
            let node = data.nodes[key]
            this.output(node, 1)
            for (let i=0; i< node.children.length; i++) {
                let child = node.children[i]
                if (child.type === "primitive") {
                    console.log("" + new Array(2 * 4).join(' ') + " - " + child.type + " with "  + child.representations.length + " " + child.subtype + " representation(s)")
                    if (child.subtype === "nurbs") {
                        console.log("" + new Array(3 * 4).join(' ') + " - " + child.representations[0].controlpoints.length + " control points")
                    }
                }
                else {
                    this.output(child, 2)
                }
            }
        }
    }

    render(data) {
        console.log("---- Render phase ----");
        console.log(data);
        this.data = data;
        this.renderGlobals(data.options);
        this.renderCameras(data.cameras);
        this.renderTextures(data.textures);
        this.renderMaterials(data.materials);
        this.renderObjects(data.nodes);
        this.displayObjects(data.nodes);
    }

    renderGlobals(opt) {
        if (opt.background !== undefined) {
            let color = this.createColor(opt.background);
            this.app.scene.background = color;
        }

        if (opt.ambient !== undefined) {
            let color = this.createColor(opt.ambient);
            this.ambient = new THREE.AmbientLight(color);
            this.app.scene.add(this.ambient);
        }
    }

    renderCameras(cameras) {
        this.app.activeCameraName = this.data.activeCameraId;
        for (const cameraKey in cameras) {
            const camera = cameras[cameraKey];
            switch (camera.type) {
                case "perspective":
                    const perspective = new THREE.PerspectiveCamera(camera.angle, 1, camera.near, camera.far);
                    perspective.position.set(...camera.location);
                    perspective.lookAt(camera.target);
                    this.app.cameras[camera.id] = perspective;
                    break;
                case "orthogonal":
                    const orthogonal = new THREE.OrthographicCamera(camera.left, camera.right, camera.top, camera.bottom, camera.near, camera.far);
                    orthogonal.position.set(...camera.location);
                    orthogonal.lookAt(camera.target);
                    this.app.cameras[camera.id] = orthogonal;
                    break;
            }
        };
        this.cameras = this.app.cameras;
        console.log("Cameras: ", this.cameras);
    }

    renderTextures(textures) {
        for (const textureKey in textures) {
            const textureData = textures[textureKey];
            const texture = textureData.isVideo ? 
                new THREE.VideoTexture(textureData.filepath)
                :
                new THREE.TextureLoader().load(textureData.filepath);
            texture.anisotropy = textureData.anisotropy;
            texture.magFilter = eval(`THREE.${textureData.magFilter}`);
            texture.minFilter = eval(`THREE.${textureData.minFilter}`);
            this.textures[textureData.id] = texture;
        };
        console.log("Textures: ", this.textures);
    }

    renderMaterials(materials) {
        for (const materialKey in materials) {
            const materialData = materials[materialKey];
            const material = 
            materialData.specular ?
                new THREE.MeshPhongMaterial({
                    color: this.createColor(materialData.color),
                    specular: this.createColor(materialData.specular),
                    emissive: this.createColor(materialData.emissive),
                    shininess: materialData.shininess,
                    side: materialData.twosided ? THREE.DoubleSide : THREE.FrontSide,
                    map: this.textures[materialData.textureref]
                })
                :
                new THREE.MeshStandardMaterial({
                    color: this.createColor(materialData.color),
                    shininess: materialData.shininess,
                    side: materialData.twosided ? THREE.DoubleSide : THREE.FrontSide,
                    wireframe: materialData.wireframe,
                    flatShading: materialData.shading === 'flat',
                    map: this.textures[materialData.textureref]
                });
            this.materials[materialData.id] = material;
        };
        console.log("Materials: ", this.materials);
    }

    renderObjects(objects) {
        this.createSceneGraph(objects);
        console.log("scene graph: ", this.sceneGraph);

        const visited = [];
        console.log("objects: ", objects[this.data.rootId]);
        this.renderObject(this.data.rootId, objects, visited);
        console.log("visited: ", visited);
        this.meshes = visited;
        for (const objectKey in this.sceneGraph) {
            const objectData = objects[objectKey];

        }

    }

    renderObject(nodeId, objects, visited, parentData=undefined, idx=0) {
        let mesh = new THREE.Group();
        let childMesh = null;
        let index = idx;
        const nodeData = objects[nodeId];

        if (nodeData === undefined) {
            return this.createPrimitive(nodeId, parentData, index);
        }

        index = 0;

        for (const childId of this.sceneGraph.nodes[nodeData.id]) {
            // table -> [top, leg1, leg2, ...] -> leg1 -> cylinder
            if (visited[childId] === undefined) {
                visited[childId] = []
            }
            const createdMesh = this.renderObject(childId, objects, visited, nodeData, index);
            visited[childId].push(createdMesh);
            
            childMesh = createdMesh.clone();

            const material = nodeData.materialIds.map((id) => this.materials[id]) ?? this.mat;
            // mesh.material = material;

            // transform
            if (nodeData.transformations.length > 0) {
                console.log(nodeData.id, nodeData.transformations);
                this.transformObject(nodeData.transformations, childMesh);
            }
            

            mesh.add(childMesh);

            index += 1;
        }

        return mesh;
    }

    resetTransformations(mesh) {
        mesh.rotation.set(0, 0, 0);
        mesh.position.set(0, 0, 0);
        mesh.scale.set(1, 1, 1);
    }

    transformObject(transformations, mesh) {
        for (const transformation of transformations) {
            switch (transformation.type) {
                case "T":
                    mesh.position.set(...transformation.translate);
                    break;
                case "R":
                    const rotation = transformation.rotation.map((x) => x * Math.PI / 180);
                    // mesh.rotation.set(...rotation);
                    mesh.rotation.x = rotation[0];
                    mesh.rotation.y = rotation[1];
                    mesh.rotation.z = rotation[2];
                    break;
                case "S":
                    mesh.scale.set(...transformation.scale);
                    break;
                default:
                    console.log("unknown transformation type: ", transformation.type);
                    break;
            }
        }
    }

    createPrimitive(nodeId, objectData, index) {
        let geometry;
        // console.log("Creating primitive ", objectData.children[index]);
        const representation = objectData.children[index].representations[0];
        let width, height, depth;
        switch (nodeId) {
            case "rectangle":
                console.log("it's a rectangle");
                width = representation.xy2[0] - representation.xy1[0];
                height = representation.xy2[1] - representation.xy1[1];
                geometry = new THREE.PlaneGeometry(width, height, representation.parts_x, representation.parts_y);
                break;
            case "cylinder":
                console.log("it's a cylinder");
                geometry = new THREE.CylinderGeometry(representation.top, representation.bottom, representation.height, representation.slices, representation.stacks, representation.capsclose, representation.thetastart, representation.thetalength);
                break;
            case "sphere":
                console.log("it's a sMesh(plane, materialphere");
                geometry = new THREE.SphereGeometry(5, 5, 5);
                break;
            case "triangle":
                console.log("it's a triangle");
                geometry = new THREE.Triangle(representation.xyz1, representation.xyz2, representation.xyz3);
                break;
            case "box":
                console.log("it's a box");
                width = representation.xyz2[0] - representation.xyz1[0];
                height = representation.xyz2[1] - representation.xyz1[1];
                depth = representation.xyz2[2] - representation.xyz1[2];
                geometry = new THREE.BoxGeometry(width, height, depth, representation.parts_x, representation.parts_y, representation.parts_z);
                break;  
            case "skybox":
                console.log("it's a skybox");
                width = representation.xyz2[0] - representation.xyz1[0];
                height = representation.xyz2[1] - representation.xyz1[1];
                depth = representation.xyz2[2] - representation.xyz1[2];
                geometry = new THREE.BoxGeometry(width, height, depth, representation.parts_x, representation.parts_y, representation.parts_z);
                console.log("rep: ", representation);
                break;
            case "model3d":
                console.log("it's a model3d");
                geometry = new THREE.ObjectLoader().load(representation.filepath);
                break;
            case "nurbs":
                // TODO: implement nurbs
                console.log("it's a nurbs");
                console.log("nurb rep: ", representation);
                // const builder = new MyNurbsBuilder(this.app);
                // geometry = builder.build(representation.controlpoints, representation.degree_u, representation.degree_v, representation.parts_u, representation.parts_v, representation.knots_u, representation.knots_v);

                break;
            default:
                console.log("it's something else");
                console.log("else", representation);
                break;
        }
        const mesh = new THREE.Mesh(geometry);
        return mesh;
    }

    createSceneGraph(objects) {
        const graph = new MyGraph(Object.keys(objects).concat(this.data.primitiveIds));
        for (const objectKey in objects) {
            const objectData = objects[objectKey];
            for (const child of objectData.children) {
                graph.addEdge(objectData.id, child.id ?? child.subtype);
            }
        }
        graph.printGraph('scene');
        this.sceneGraph = graph;
        console.log(this.sceneGraph);
    }

    createColor(color) {
        return new THREE.Color(`rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255}, 1)`);
    }

    displayObjects(objects) {
        /*
        const mat = new THREE.MeshPhongMaterial({color: 0x00ff00});
        console.log(this.materials['crimeWeaponApp']);
        const cube = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), this.materials['floorApp']);
        const cube2 = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 5), mat);
        cube2.position.set(0, 10, 0);
        cube.add(cube2);
        this.app.scene.add(cube);
        this.mat = mat;
        */

        for (const key of objects[this.data.rootId].children) {
            const meshes = this.meshes[key.id] ?? [];
            if (meshes.length >= 1) {
                console.log(key.id);
                for (const mesh of meshes) {
                    this.app.scene.add(mesh);
                    console.log("added mesh ", mesh.children[0].rotation);
                }
            }
        }
        
    }

    update() {

    }
}

export { MyContents };