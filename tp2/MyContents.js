import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
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
		this.reader.open("scenes/darkroom/darkroom.xml");
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
        const allObjs = {...data.nodes, ...data.lods};
        this.renderGlobals(data.options);
        this.renderCameras(data.cameras);
        this.renderSkybox(data.skyboxes);
        this.renderTextures(data.textures);
        this.renderMaterials(data.materials);
        this.renderObjects(allObjs);
        this.displayObjects(allObjs);
    }

    renderGlobals(opt) {
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

    renderCameras(cameras) {
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
        console.log("Cameras: ", this.cameras);
    }

    renderSkybox(skyboxes) {
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

    renderTextures(textures) {
        for (const textureKey in textures) {
            const textureData = textures[textureKey];
            console.log(`the texture id is ${textureData.id} with filepath ${textureData.filepath}`);
            const video = document.createElement('video');
            if (textureData.isVideo) {
                console.log("new video texture!");
                video.src = textureData.filepath;
                video.loop = true;
                video.load();
                video.play();
            }
            const texture = textureData.isVideo ? 
                new THREE.VideoTexture(video)
                :
                new THREE.TextureLoader().load(textureData.filepath);
            texture.anisotropy = textureData.anisotropy;
            if (!textureData.mipmaps) {
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
        console.log("Textures: ", this.textures);
    }

    loadMipmap(parent, texture, level) {
        const image = new THREE.TextureLoader().load(texture, () => {
            parent.mipmaps[level] = image.image;
        });
    }

    renderMaterials(materials) {
        this.app.wireframe = false;
        this.app.wireframes = [];
        for (const materialKey in materials) {
            const materialData = materials[materialKey];
            console.log(`the texture id is ${materialData.textureref} for material ${materialData.id}`);
            console.log("color: ", materialData.color);
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
                    map: texture
                })
                :
                new THREE.MeshStandardMaterial({
                    color: materialData.color,
                    shininess: materialData.shininess,
                    side: materialData.twosided ? THREE.DoubleSide : THREE.FrontSide,
                    wireframe: materialData.wireframe,
                    flatShading: materialData.shading === 'flat',
                    map: texture,
                    bumpMap: this.textures[materialData.bumpref],
                    bumpScale: materialData.bumpscale,
                    specularMap: this.textures[materialData.specularref]
                });
            if (materialData.wireframe) {
                this.app.wireframes.push(material);
                material.wireframe = this.app.wireframe;
            }
            
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
    }

    renderObject(nodeId, objects, visited, parentData=undefined, idx=0) {
        const nodeData = objects[nodeId];

        if (nodeData?.type !== "lod" ) {
            let group = new THREE.Group();
            group.castShadow = true;
            group.receiveShadow = true;
            let childMesh = null;
            let index = idx;
    
            if (nodeData === undefined) {
                console.log(`Object ${parentData.id} is applying this materialId: `, parentData.materialIds[0]);
                if (parentData.children[index].type?.includes("light")) return this.createLight(parentData.children[index]);
                return this.createPrimitive(nodeId, parentData, index);
            }
    
            index = 0;
    
            for (const childId of this.sceneGraph.getNode(nodeId)) {
                console.log("renderObject", nodeData, objects[childId]);
                if (visited[childId] === undefined) {
                    visited[childId] = []
                }
                if (nodeId !== this.data.rootId && parentData.materialIds?.length !== 0 && nodeData.materialIds?.length === 0) {
                    nodeData.materialIds = parentData.materialIds;
                    console.log(`Passing ${parentData.materialIds[0]} to ${nodeId}`);
                }
                const createdMesh = this.renderObject(childId, objects, visited, nodeData, index);
                visited[childId].push(createdMesh);
                
                childMesh = createdMesh;
                console.log(childMesh)
    
                // transform
                if (nodeData.transformations.length > 0) {
                    console.log(nodeData.id);
                    const newMatrix = this.transformObject(nodeData.transformations);
                    console.log("newMatrix: ", newMatrix);
                    childMesh.applyMatrix4(newMatrix);
                }
                
    
                group.add(childMesh);
    
                index += 1;
            }
    
            return group;    
        } else {
            const lod = new THREE.LOD();
            for (const child of nodeData.children) {
                console.log(child);
                const mesh = this.renderObject(child.node.id, objects, visited, parentData);
                lod.addLevel(mesh, child.mindist);
            }
            return lod;
        }
    }

    transformObject(transformations) {
        const matrix = new THREE.Matrix4();
        console.log("transformations: ", transformations);
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
                    /*
                    const rotation = transformation.rotation.map((x) => x * Math.PI / 180);
                    // mesh.rotation.set(...rotation);
                    mesh.rotation.x = rotation[0];
                    mesh.rotation.y = rotation[1];
                    mesh.rotation.z = rotation[2];
                    */
                    break;
                case "S":
                    const scaleMatrix = new THREE.Matrix4().makeScale(...transformation.scale);
                    matrix.multiply(scaleMatrix);
                    break;
                default:
                    console.log("unknown transformation type: ", transformation.type);
                    break;
            }
        }
        return matrix;
    }

    createLight(lightNode) {
        console.log("Creating light ", lightNode);
        let light;
        switch (lightNode.type) {
            case "pointlight":
                console.log("Point light");
                light = new THREE.PointLight(lightNode.color, lightNode.intensity, lightNode.distance, lightNode.decay);
                light.position.set(...lightNode.position);
                
                // const pointLightHelper = new THREE.PointLightHelper(light);
                // this.app.scene.add(pointLightHelper);
                
                break;
            case "directionallight":
                console.log("Directional light");
                light = new THREE.DirectionalLight(lightNode.color, lightNode.intensity);
                light.position.set(...lightNode.position);
                light.shadow.camera.top = lightNode.shadowtop;
                light.shadow.camera.bottom = lightNode.shadowbottom;
                light.shadow.camera.left = lightNode.shadowleft;
                light.shadow.camera.right = lightNode.shadowright;

                // this.app.scene.add(new THREE.CameraHelper(light.shadow.camera));
                break;
            case "spotlight":
                console.log("spotlight");
                light = new THREE.SpotLight(lightNode.color, lightNode.intensity, lightNode.distance, lightNode.angle, lightNode.penumbra, lightNode.decay);
                light.position.set(...lightNode.position);
                light.target.position.set(...lightNode.target);

                this.app.scene.add(new THREE.SpotLightHelper(light));
                break;
        }
        light.castShadow = lightNode.castshadow;
        light.shadow.camera.far = lightNode.shadowfar;
        light.shadow.mapSize.width = lightNode.shadowmapsize;
        light.shadow.mapSize.height = lightNode.shadowmapsize;

        return light;
    }

    createPrimitive(nodeId, objectData, index) {
        let geometry;
        console.log("Creating primitive ", objectData.children[index]);
        const representation = objectData.children[index].representations[0];
        let width, height, depth, center_x, center_y, center_z, vertices, indices;
        switch (nodeId) {
            case "rectangle":
                console.log("it's a rectangle");
                width = Math.abs(representation.xy2[0] - representation.xy1[0]);
                height = Math.abs(representation.xy2[1] - representation.xy1[1]);
                center_x = (representation.xy2[0] + representation.xy1[0]) / 2;
                center_y = (representation.xy2[1] + representation.xy1[1]) / 2;
                geometry = new THREE.PlaneGeometry(width, height, representation.parts_x, representation.parts_y);
                geometry.translate(center_x, center_y, 0);
                break;
            case "cylinder":
                console.log("it's a cylinder");
                geometry = new THREE.CylinderGeometry(representation.top, representation.base, representation.height, representation.slices, representation.stacks, !representation.capsclose, representation.thetastart, representation.thetalength);
                break;
            case "sphere":
                console.log("it's a sphere");
                const radius = representation.radius ?? 1;
                const thetastart = (representation.thetastart) ?? 0;
                const thetalength = (representation.thetalength) ?? Math.PI;
                const phistart = (representation.phistart) ?? 0;
                const philength = (representation.philength) ?? Math.PI * 2;
                geometry = new THREE.SphereGeometry(radius, (representation.slices) ?? 32, (representation.stacks) ?? 16, phistart, philength, thetastart, thetalength);
                console.log("new sphere: ", geometry);
                break;
            case "triangle":
                console.log("it's a triangle");
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
                console.log("it's a box");
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
                console.log("it's a model3d");
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
                console.log("it's a nurbs");
                console.log("nurb rep: ", representation);
                center_x = (representation.controlpoints[representation.controlpoints.length - 1].xx + representation.controlpoints[0].xx) / 2;
                center_y = (representation.controlpoints[representation.controlpoints.length - 1].yy + representation.controlpoints[0].yy) / 2;
                center_z = (representation.controlpoints[representation.controlpoints.length - 1].zz + representation.controlpoints[0].zz) / 2;
                const builder = new MyNurbsBuilder(this.app);
                geometry = builder.build(representation.controlpoints, representation.degree_u, representation.degree_v, representation.parts_u, representation.parts_v);
                geometry.translate(-center_x, -center_y, -center_z);
                break;
            case "polygon":
                console.log("it's a polygon", representation);
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
                console.log("it's something else");
                console.log("else", representation);
                break;
        }
        const mesh = new THREE.Mesh(geometry, this.materials[objectData.materialIds[0]] ?? this.mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    }

    createSceneGraph(objects) {
        const rootNodeChildIds = objects[this.data.rootId].children.map((node) => node.id ?? node.subtype);
        console.log("in the scene: ", rootNodeChildIds);
        const graph = new MyGraph(Object.keys(objects).concat(this.data.primitiveIds).concat(rootNodeChildIds).concat(["pointlight", "directionallight", "spotlight"]));
        for (const objectKey in objects) {
            const objectData = objects[objectKey];
            for (const child of objectData.children) {
                const id = child.type?.includes("light") ? child.type : child.id ?? child.subtype;
                graph.addEdge(objectData.id, id);
            }
        }
        graph.printGraph(this.data.rootId);
        this.sceneGraph = graph;
        console.log(this.sceneGraph);
    }

    displayObjects(objects) {
        console.log("meshes: ", this.meshes);
        for (const key of objects[this.data.rootId].children) {
            console.log("key: ", key);
            const meshes = this.meshes[key.id] ?? this.meshes[key.type] ?? [];
            if (meshes.length >= 1) {
                console.log("key.id: ", key.id);
                for (const mesh of meshes) {
                    this.app.scene.add(mesh);
                    console.log("added mesh ", mesh);
                }
            }
        }
    }

    changeColor(color, mesh, isLight) {
        this.meshes[mesh].map(obj =>
            obj.children.map(child => {
                isLight ? child.type.toLowerCase().includes("light") ? child.color = color : false : child.color = color;
            })
        );
    }

    update() {

    }
}

export { MyContents };