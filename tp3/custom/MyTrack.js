import * as THREE from "three";

class MyTrack extends THREE.Object3D {
    constructor(app, width=4, points=[], routes=[], powerups=[], obstacles=[]) {
        super();
        this.app = app;
        this.width = width
        this.type = "Group";
        this.width = width;
        this.points = points;

        this.trackTexture = new THREE.TextureLoader().load(
            "scenes/feupzero/textures/asphalt.jpg"
        );
        this.trackTexture.wrapS = THREE.RepeatWrapping;
        this.trackTexture.wrapT = THREE.RepeatWrapping;
        this.trackTexture.repeat = new THREE.Vector3(5, 10);
        this.curveMaterial = new THREE.LineDashedMaterial({
          color: 0xffffff,
          linewidth: 5,
          scale: 5,
          dashSize: 5,
          gapSize: 5
        });
        this.trackMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            map: this.trackTexture,
            side: THREE.DoubleSide,
            wireframe: false
        });

        this.curveMesh = this.buildCurve();
        this.track = new THREE.PlaneGeometry( 1, 1, 300, 1 );
        this.trackMesh = this.buildSegments();

        this.add(this.curveMesh);
        this.add(this.trackMesh);
    }

    buildCurve() {
      const curve = new THREE.CatmullRomCurve3(
        [
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(20, 0, 20),
          new THREE.Vector3(20, 0, 0),
          new THREE.Vector3(6, 0, -2),
          new THREE.Vector3(6, 0, -6),
          new THREE.Vector3(0, 0, -6),
          new THREE.Vector3(-6, 0, -12),
          new THREE.Vector3(-12, 0, -3),
        ],
        true,
        "catmullrom",
        0.2
      );
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(100)), this.curveMaterial);
      line.computeLineDistances();
      return line;
    }

    buildSegments() {
      const curve = new THREE.CatmullRomCurve3(
        [
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(20, 0, 20),
          new THREE.Vector3(20, 0, 0),
          new THREE.Vector3(6, 0, -2),
          new THREE.Vector3(6, 0, -6),
          new THREE.Vector3(0, 0, -6),
          new THREE.Vector3(-6, 0, -12),
          new THREE.Vector3(-12, 0, -3),
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(20, 0, 20),
        ],
        false,
        "catmullrom",
        0.2
      );
      const plane = new THREE.Mesh(this.track, this.trackMaterial);
      const position = plane.geometry.getAttribute('position');
      const n = position.count/2; // We will define 2 points at a time, so the loop will only go until half the length of the array
      const w = this.width/2 // Multiply the tangent coordinate by this value so that the track will have the intended width
      
      for (let i=0; i<n; i++) {
          const point = curve.getPoint(i/(n-1));
          const tangent = curve.getTangent(i/(n-1));
          //console.log(point, tangent);
        
          // Pairing x with z because we actually want to define two points which belong to a line perpendicular to the tangent
          position.setXYZ(i, point.x-tangent.z*w, 0, point.z+tangent.x*w);
          position.setXYZ(i+n, point.x+tangent.z*w, 0, point.z-tangent.x*w);
      }
      return plane;
    }
}

export { MyTrack };
