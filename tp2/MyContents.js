import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MyAxis } from './MyAxis.js';
import { MyFileReader } from './parser/MyFileReader.js';
import { MyGraph } from './MyGraph.js';
import { MyNurbsBuilder } from './helper/MyNurbsBuilder.js';
import { MySceneData } from './parser/MySceneData.js';

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
        this.cameras = [];
        this.textures = [];
        this.materials = [];
        this.sceneGraph = null;
        this.meshes = {};
        this.helpers = [];
        this.controlsTargets = [];
        this.activeCameraTarget = null;
        this.scenePath = "scenes/darkroom/darkroom.xml";

        this.reader = new MyFileReader(app, this, this.onSceneLoaded);
		this.reader.open(this.scenePath);
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
            this.axis.visible = false;
        }
    }

    /**
     * Called when the scene xml file load is complete
     * @param {MySceneData} data the entire scene data object
     */
    onSceneLoaded(data) {
        //console.info("scene data loaded " + data + ". visit MySceneData javascript class to check contents for each data item.")
        //this.onAfterSceneLoadedAndBeforeRender(data);
        this.convert(data);
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

    /**
     * Converts all data parsed.
     * @param {*} data the entire scene data object
     */
    convert(data) {
        this.data = data;
        const allObjs = {...data.nodes, ...data.lods};
        this.convertGlobals(data.options);
        this.convertCameras(data.cameras);
        this.convertSkyboxes(data.skyboxes);
        this.convertTextures(data.textures);
        this.convertMaterials(data.materials);
        this.convertObjects(allObjs);
        this.displayObjects(allObjs);
        this.defineControls();
    }

    /**
     * Converts the global parameters parsed.
     * @param {MySceneData} opt the global options in the scene data object
     */
    convertGlobals(opt) {
        if (opt.background !== undefined) {
            let color = opt.background;
            this.app.scene.background = color;
        }

        if (opt.ambient !== undefined) {
            let color = opt.ambient;
            this.ambient = new THREE.AmbientLight(color);
            this.app.scene.add(this.ambient);
        }
    }

    /**
     * Converts the cameras parsed.
     * @param {MySceneData} cameras the cameras defined in the scene data object
     */
    convertCameras(cameras) {
        this.app.activeCameraName = this.data.activeCameraId;
        for (const cameraKey in cameras) {
            const camera = cameras[cameraKey];
            switch (camera.type) {
                case "perspective":
                    const perspective = new THREE.PerspectiveCamera(camera.angle, 1, camera.near, camera.far);
                    perspective.position.set(...camera.location);
                    perspective.lookAt(camera.target);
                    this.cameras[camera.id] = perspective;
                    break;
                case "orthogonal":
                    const orthogonal = new THREE.OrthographicCamera(camera.left, camera.right, camera.top, camera.bottom, camera.near, camera.far);
                    orthogonal.position.set(...camera.location);
                    orthogonal.lookAt(camera.target);
                    this.cameras[camera.id] = orthogonal;
                    break;
            }
        };
        this.app.cameras = this.cameras;
    }

    /**
     * Converts the skyboxes parsed.
     * @param {MySceneData} skyboxes the skyboxes defined in the scene data object
     */
    convertSkyboxes(skyboxes) {
        for (const skyboxId in skyboxes) {

            const skybox = skyboxes[skyboxId];
            const sky = new THREE.Group();

            const x = skybox.size[0];
            const y = skybox.size[1];
            const z = skybox.size[2];
            
            const upGeometry = new THREE.PlaneGeometry(x, z, 1, 1);
            const downGeometry = new THREE.PlaneGeometry(x, z, 1, 1);
            const leftGeometry = new THREE.PlaneGeometry(x, y, 1, 1);
            const rightGeometry = new THREE.PlaneGeometry(x, y, 1, 1);
            const frontGeometry = new THREE.PlaneGeometry(z, y, 1, 1);
            const backGeometry = new THREE.PlaneGeometry(z, y, 1, 1);

            const texture = new THREE.TextureLoader();

            const material =  new THREE.MeshBasicMaterial({
                emissive: skybox.emissive,
                intensity: skybox.intensity,
            });

            material.map = texture.load(skybox.up);
            const up = new THREE.Mesh(upGeometry, material.clone());
            material.map = texture.load(skybox.down)
            const down = new THREE.Mesh(downGeometry, material.clone());
            material.map = texture.load(skybox.left)
            const left = new THREE.Mesh(leftGeometry, material.clone());
            material.map = texture.load(skybox.right)
            const right = new THREE.Mesh(rightGeometry, material.clone());
            material.map = texture.load(skybox.front)
            const front = new THREE.Mesh(frontGeometry, material.clone());
            material.map = texture.load(skybox.back)
            const back = new THREE.Mesh(backGeometry, material.clone());
    
            up.position.set(skybox.center[0], y/2 + skybox.center[1], skybox.center[2]);
            down.position.set(skybox.center[0], -y/2 + skybox.center[1], skybox.center[2]);
            left.position.set(-x/2 + skybox.center[0], skybox.center[1], skybox.center[2]);
            right.position.set(x/2 + skybox.center[0], skybox.center[1], skybox.center[2]);
            front.position.set(skybox.center[0], skybox.center[1], z/2 + skybox.center[2]);
            back.position.set(skybox.center[0], skybox.center[1], -z/2 + skybox.center[2]);

            up.rotation.set(Math.PI/2, 0, Math.PI);
            down.rotation.set(-Math.PI/2, 0, Math.PI);
            left.rotation.set(0, Math.PI/2, 0);
            right.rotation.set(0, -Math.PI/2, 0);
            front.rotation.set(0, Math.PI, 0);
            back.rotation.set(0, 0, 0);
    
            sky.add(up);
            sky.add(down);
            sky.add(left);
            sky.add(right);
            sky.add(front);
            sky.add(back);
    
            this.app.scene.add(sky);
        }
    }

    /**
     * Converts the textures parsed.
     * @param {MySceneData} textures the textures defined in the scene data object
     */
    convertTextures(textures) {
        for (const textureKey in textures) {
            const textureData = textures[textureKey];
            let texture;
            if (textureData.isVideo) {
                const video = document.createElement('video');
                video.src = textureData.filepath;
                video.loop = true;
                video.load();
                video.play();
                texture = new THREE.VideoTexture(video);
            } else {
                texture = new THREE.TextureLoader().load(textureData.filepath);
            } 
            if (!textureData.mipmaps && textureData.mipmap0) {
                texture.generateMipmaps = false;
                if (textureData.mipmap0) this.loadMipmap(texture, textureData.mipmap0, 0);
                if (textureData.mipmap1) this.loadMipmap(texture, textureData.mipmap1, 1);
                if (textureData.mipmap2) this.loadMipmap(texture, textureData.mipmap2, 2);
                if (textureData.mipmap3) this.loadMipmap(texture, textureData.mipmap3, 3);
                if (textureData.mipmap4) this.loadMipmap(texture, textureData.mipmap4, 4);
                if (textureData.mipmap5) this.loadMipmap(texture, textureData.mipmap5, 5);
                if (textureData.mipmap6) this.loadMipmap(texture, textureData.mipmap6, 6);
                if (textureData.mipmap7) this.loadMipmap(texture, textureData.mipmap7, 7);
            }
            else {
                texture.generateMipmaps = true;
                texture.magFilter = eval(`THREE.${textureData.magFilter}`);
                texture.minFilter = eval(`THREE.${textureData.minFilter}`);
            }
            this.textures[textureData.id] = texture;
        };
    }

    loadMipmap(parent, texture, level) {
        const image = new THREE.TextureLoader().load(texture, () => {
            parent.mipmaps[level] = image.image;
        });
    }

    /**
     * Converts the materials parsed.
     * @param {MySceneData} materials the materials defined in the scene data object
     */
    convertMaterials(materials) {
        this.app.wireframe = false;
        this.app.wireframes = [];
        for (const materialKey in materials) {
            const materialData = materials[materialKey];
            const texture = this.textures[materialData.textureref];
            if (texture !== undefined) {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat = new THREE.Vector2(1/materialData.texlength_s, 1/materialData.texlength_t);
            }
            const material = 
            !materialData.bumpref ?
                new THREE.MeshPhongMaterial({
                    color: materialData.color,
                    specular: materialData.specular,
                    emissive: materialData.emissive,
                    shininess: materialData.shininess,
                    side: materialData.twosided ? THREE.DoubleSide : THREE.FrontSide,
                    transparent: materialData.color.a !== 1.0,
                    opacity: materialData.color.a,
                    map: texture ?? null
                })
                :
                new THREE.MeshPhongMaterial({
                    color: materialData.color,
                    shininess: materialData.shininess,
                    side: materialData.twosided ? THREE.DoubleSide : THREE.FrontSide,
                    wireframe: materialData.wireframe,
                    flatShading: materialData.shading === 'flat',
                    map: texture ?? null,
                    bumpMap: this.textures[materialData.bumpref],
                    bumpScale: materialData.bumpscale,
                    specularMap: this.textures[materialData.specularref] ?? null
                });
            if (materialData.wireframe) {
                this.app.wireframes.push(material);
                material.wireframe = this.app.wireframe;
            }
            
            this.materials[materialData.id] = material;
        };
    }

    /**
     * Converts the objects parsed.
     * @param {MySceneData} objects the objects defined in the scene data object
     */
    convertObjects(objects) {
        const meshes = [];
        this.createSceneGraph(objects);
        this.convertObject(this.data.rootId, objects, meshes);
        this.meshes = meshes;
    }

    /**
     * 
     * @param {string} nodeId the ID of the current node
     * @param {MySceneData} objects the objects defined in the scene data object
     * @param {Array} visited the nodes visited (meshes created)
     * @param {MySceneData | undefined} parentData the data from the parent of the current node.
     * @param {number} idx the index of the current node in the parent's children array 
     * @returns A ThreeJS object (Group, LOD or BufferGeometry)
     */
    convertObject(nodeId, objects, visited, parentData=undefined, idx=0) {
        const nodeData = objects[nodeId];

        if (nodeData?.type !== "lod" ) {
            let group = new THREE.Group();
            group.castShadow = true;
            group.receiveShadow = true;
            group.matrixAutoUpdate = false;
            let index = idx;
    
            if (nodeData === undefined) {
                if (parentData.children[index].type?.includes("light")) return this.createLight(parentData.children[index]);
                return this.createPrimitive(nodeId, parentData, index);
            }

            if (nodeData.transformations.length > 0) {
                const newMatrix = this.transformObject(nodeData.transformations);
                group.applyMatrix4(newMatrix);
            }
    
            index = 0;
    
            for (const childId of this.sceneGraph.getNode(nodeId)) {
                if (visited[childId] === undefined) {
                    visited[childId] = []
                }
                if (nodeId !== this.data.rootId && parentData.materialIds?.length !== 0 && nodeData.materialIds?.length === 0) {
                    nodeData.materialIds = parentData.materialIds;
                }
                const childMesh = this.convertObject(childId, objects, visited, nodeData, index);
                visited[childId].push(childMesh);
                
                childMesh.name = nodeId + "_" + childId + index;
                group.add(childMesh);
    
                index += 1;
            }
    
            return group;    
        } else {
            const lod = new THREE.LOD();
            for (const child of nodeData.children) {
                const mesh = this.convertObject(child.node.id, objects, visited, parentData);
                lod.addLevel(mesh, child.mindist);
            }
            return lod;
        }
    }

    /**
     * Generates the transformation matrix from an array of transformations.
     * @param {Array} transformations the transformations to be applied.
     * @returns The appropriate transformation matrix.
     */
    transformObject(transformations) {
        const matrix = new THREE.Matrix4();
        for (const transformation of transformations) {
            switch (transformation.type) {
                case "T":
                    let transformationMatrix = new THREE.Matrix4().makeTranslation(...transformation.translate);
                    matrix.multiply(transformationMatrix);
                    break;
                case "R":
                    const rotation = transformation.rotation.map((x) => x * Math.PI / 180);
                    const rotationMatrix = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(...rotation), "XYZ");
                    matrix.multiply(rotationMatrix);
                    break;
                case "S":
                    const scaleMatrix = new THREE.Matrix4().makeScale(...transformation.scale);
                    matrix.multiply(scaleMatrix);
                    break;
                default:
                    throw TypeError(`Unsupported transformation type ${transformation.type}.`)
            }
        }
        return matrix;
    }

    /**
     * Converts the light data node into a ThreeJS Light object.
     * @param {MySceneData} lightNode the light data from the scene data object
     * @returns a ThreeJS Light object.
     */
    createLight(lightNode) {
        let light;
        switch (lightNode.type) {
            case "pointlight":
                light = new THREE.PointLight(lightNode.color, lightNode.intensity, lightNode.distance, lightNode.decay);
                light.position.set(...lightNode.position);
                
                const pointLightHelper = new THREE.PointLightHelper(light);
                pointLightHelper.visible = false;
                this.helpers.push(pointLightHelper);
                this.app.scene.add(pointLightHelper);
                
                break;
            case "directionallight":
                light = new THREE.DirectionalLight(lightNode.color, lightNode.intensity);
                light.position.set(...lightNode.position);
                light.shadow.camera.top = lightNode.shadowtop;
                light.shadow.camera.bottom = lightNode.shadowbottom;
                light.shadow.camera.left = lightNode.shadowleft;
                light.shadow.camera.right = lightNode.shadowright;

                const directionalLightHelper = new THREE.DirectionalLightHelper(light, 5);
                directionalLightHelper.visible = false;
                this.helpers.push(directionalLightHelper);
                this.app.scene.add(directionalLightHelper);
                break;
            case "spotlight":
                light = new THREE.SpotLight(lightNode.color, lightNode.intensity, lightNode.distance, lightNode.angle * Math.PI / 190, lightNode.penumbra, lightNode.decay);
                light.position.set(...lightNode.position);
                light.target.position.set(...lightNode.target);

                const spotLightHelper = new THREE.SpotLightHelper(light);
                spotLightHelper.visible = false;
                this.helpers.push(spotLightHelper);
                this.app.scene.add(spotLightHelper);
                break;
        }
        light.castShadow = lightNode.castshadow;
        light.shadow.camera.far = lightNode.shadowfar;
        light.shadow.mapSize.width = lightNode.shadowmapsize;
        light.shadow.mapSize.height = lightNode.shadowmapsize;

        return light;
    }
    /**
     * 
     * @param {string} nodeId The id of the current primitive node
     * @param {MySceneData} objectData The data on the current primitive node's parent.
     * @param {number} index the index of the current node in the parent's children array
     * @returns 
     */
    createPrimitive(nodeId, objectData, index) {
        let geometry;
        const representation = objectData.children[index].representations[0];
        let width, height, depth, center_x, center_y, center_z, vertices, indices;
        switch (nodeId) {
            case "rectangle":
                width = Math.abs(representation.xy2[0] - representation.xy1[0]);
                height = Math.abs(representation.xy2[1] - representation.xy1[1]);
                center_x = (representation.xy2[0] + representation.xy1[0]) / 2;
                center_y = (representation.xy2[1] + representation.xy1[1]) / 2;
                geometry = new THREE.PlaneGeometry(width, height, representation.parts_x, representation.parts_y);
                geometry.translate(center_x, center_y, 0);
                break;
            case "cylinder":
                geometry = new THREE.CylinderGeometry(representation.top, representation.base, representation.height, representation.slices, representation.stacks, !representation.capsclose, representation.thetastart, representation.thetalength);
                break;
            case "sphere":
                const radius = representation.radius ?? 1;
                const thetastart = (representation.thetastart) ?? 0;
                const thetalength = (representation.thetalength) ?? Math.PI;
                const phistart = (representation.phistart) ?? 0;
                const philength = (representation.philength) ?? Math.PI * 2;
                geometry = new THREE.SphereGeometry(radius, (representation.slices) ?? 32, (representation.stacks) ?? 16, phistart, philength, thetastart, thetalength);
                break;
            case "triangle":
                geometry = new THREE.BufferGeometry();
                vertices = [
                    representation.xyz1[0], representation.xyz1[1], representation.xyz1[2],
                    representation.xyz2[0], representation.xyz2[1], representation.xyz2[2],
                    representation.xyz3[0], representation.xyz3[1], representation.xyz3[2],
                ];

                indices = [
                    0, 1, 2,
                ];

                geometry.setIndex( indices );
                geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
                break;
            case "box":
                width = representation.xyz2[0] - representation.xyz1[0];
                height = representation.xyz2[1] - representation.xyz1[1];
                depth = representation.xyz2[2] - representation.xyz1[2];
                center_x = (representation.xyz2[0] + representation.xyz1[0]) / 2;
                center_y = (representation.xyz2[1] + representation.xyz1[1]) / 2;
                center_z = (representation.xyz2[2] + representation.xyz1[2]) / 2;
                geometry = new THREE.BoxGeometry(width, height, depth, representation.parts_x, representation.parts_y, representation.parts_z);
                geometry.translate(center_x, center_y, center_z);
                break;  
            case "model3d":
                const loader = new GLTFLoader();
                const s = this.app.scene;
                loader.load(representation.filepath, function (gltf) {
                    gltf.scene.traverse(function (child) {
                        if ((child).isMesh) {
                            const m = child
                            m.receiveShadow = true
                            m.castShadow = true
                        }
                        if ((child).isLight) {
                            const l = child
                            l.castShadow = true
                            l.shadow.bias = -0.003
                            l.shadow.mapSize.width = 2048
                            l.shadow.mapSize.height = 2048
                        }
                    })
                    s.add(gltf.scene)
                },);
                break;
            case "nurbs":
                center_x = (representation.controlpoints[representation.controlpoints.length - 1].xx + representation.controlpoints[0].xx) / 2;
                center_y = (representation.controlpoints[representation.controlpoints.length - 1].yy + representation.controlpoints[0].yy) / 2;
                center_z = (representation.controlpoints[representation.controlpoints.length - 1].zz + representation.controlpoints[0].zz) / 2;
                const builder = new MyNurbsBuilder(this.app);
                geometry = builder.build(representation.controlpoints, representation.degree_u, representation.degree_v, representation.parts_u, representation.parts_v);
                geometry.translate(-center_x, -center_y, -center_z);
                break;
            case "polygon":
                geometry = new THREE.BufferGeometry();
                const angle = 2 * Math.PI / representation.slices;
                const start_c = representation.color_c;
                const end_c = representation.color_p;
                let step = representation.radius / representation.stacks;
                vertices = [];
                const colors = [];

                for (let stack = 0; stack <= representation.stacks; stack++) {
                    for (let slice = 0; slice < representation.slices; slice++) {
                        const points = [
                            [                            
                                Math.cos(angle * slice) * (step * stack),
                                Math.sin(angle * slice) * (step * stack),
                                0
                            ],
                            [
                                Math.cos(angle * (slice + 1)) * (step * stack),
                                Math.sin(angle * (slice + 1)) * (step * stack),
                                0
                            ],
                            [
                                Math.cos(angle * (slice + 1)) * (step * (stack + 1)),
                                Math.sin(angle * (slice + 1)) * (step * (stack + 1)),
                                0
                            ],
                            [
                                Math.cos(angle * slice) * (step * (stack + 1)),
                                Math.sin(angle * slice) * (step * (stack + 1)),
                                0
                            ]
                        ];
                        const colors_v = [
                            new THREE.Color().lerpColors(start_c, end_c, stack * step).toArray(),
                            new THREE.Color().lerpColors(start_c, end_c, (stack + 1) * step ).toArray(),
                        ]
                        vertices.push(...points[0], ...points[3], ...points[2]);
                        colors.push(...colors_v[0], ...colors_v[1], ...colors_v[1]);
                        if (stack !== 0) {
                            vertices.push(...points[0], ...points[1], ...points[2]);
                            colors.push(...colors_v[0], ...colors_v[0], ...colors_v[1]);
                        }
                    }
                }
              
                geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
                geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
                geometry.computeVertexNormals();
                const material = new THREE.MeshPhongMaterial( { vertexColors: true, side: THREE.DoubleSide,  } );
                const mesh = new THREE.Mesh( geometry, material );
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                return mesh;
            default:
                throw TypeError(`Unsupported primitive type ${nodeId}.`)
        }
        const mesh = new THREE.Mesh(geometry, this.materials[objectData.materialIds[0]]);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    }

    /**
     * Generates a MyGraph object (a simple graph representation) which stores the scene graph.
     * @param {MySceneData} objects the objects defined in the scene data object
     */
    createSceneGraph(objects) {
        const rootNodeChildIds = objects[this.data.rootId].children.map((node) => node.id ?? node.subtype);
        const graph = new MyGraph(Object.keys(objects).concat(this.data.primitiveIds).concat(rootNodeChildIds).concat(["pointlight", "directionallight", "spotlight"]));
        for (const objectKey in objects) {
            const objectData = objects[objectKey];
            for (const child of objectData.children) {
                const id = child.type?.includes("light") ? child.type : child.id ?? child.subtype;
                graph.addEdge(objectData.id, id);
            }
        }
        this.sceneGraph = graph;
    }


    /**
     * Render the objects onto the scene.
     * @param {MySceneData} objects the objects defined in the scene data object
     */
    displayObjects(objects) {
        for (const key of objects[this.data.rootId].children) {
            const meshes = this.meshes[key.id] ?? this.meshes[key.type] ?? [];
            if (meshes.length >= 1) {
                for (const mesh of meshes) {
                    this.app.scene.add(mesh);
                }
            }
        }
    }

    changeColor(color, mesh, lightOnly) {
        this.meshes[mesh].map(obj =>
            obj.children.map(child => {
                lightOnly ? child.type.toLowerCase().includes("light") ? child.color = color : false : child.color = color;
            })
        );
    }

    defineControls() {
        if (!this.scenePath.includes("darkroom")) return;
        this.controlsTargets = {
            "Room Center": new THREE.Vector3(0, 0, 0),
            "Vinyl Player": this.getWorldPos(this.meshes["vinylPlayer"][0]) ?? new THREE.Vector3(0, 0, 0),
            "Left Table": this.getWorldPos(this.meshes["table"][0]) ?? new THREE.Vector3(0, 0, 0),
            "Poster": this.getWorldPos(this.meshes["poster"][0]) ?? new THREE.Vector3(0, 0, 0),
            "TV": this.getWorldPos(this.meshes["tv"][0]) ?? new THREE.Vector3(0, 0, 0),
        };

        this.activeCameraTarget = "Room Center";
    }

    changeControlsTarget(targetObj) {
        return this.app.controls.target.set(...this.controlsTargets[targetObj]);
    }

    getWorldPos(mesh) {
        if (mesh === undefined) return null;
        const v = new THREE.Vector3();
        return mesh.getWorldPosition(v);
    }

    printDebugInfo() {
        console.info("--- BEGIN DEBUG ---");

        console.log("Cameras: ", this.cameras);
        console.log("Textures: ", this.textures);
        console.log("Materials: ", this.materials);
        console.log("Meshes: ", this.meshes);
        this.sceneGraph.printGraph(this.data.rootId);

        console.info("--- END DEBUG ---");
    }

    update() {

    }
}

export { MyContents };