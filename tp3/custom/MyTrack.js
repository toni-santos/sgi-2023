import * as THREE from "three";

class MyTrack extends THREE.Object3D {
    constructor(app, width=4, points, routes=[], powerups=[], obstacles=[], laps=3) {
        super();
        this.app = app;
        this.width = width
        this.type = "Group";
        this.width = width;
        this.points = points;
        this.laps = 1;
        this.checkpoints = [5, 30, 60, 80];

        this.trackTexture = new THREE.TextureLoader().load(
            "scenes/feupzero/textures/dirt.png"
        );
        this.trackTexture.wrapS = THREE.RepeatWrapping;
        this.trackTexture.wrapT = THREE.RepeatWrapping;
        this.trackTexture.repeat = new THREE.Vector3(5, 10);
        this.curveMaterial = new THREE.LineDashedMaterial({
          color: 0xffffff,
          linewidth: 5,
          scale: 5,
          dashSize: 1,
          gapSize: 3
        });
        this.trackMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            map: this.trackTexture,
            side: THREE.DoubleSide,
            wireframe: false
        });

        this.curve = new THREE.CatmullRomCurve3(this.points, true, "catmullrom", 0.2);
        this.points = this.curve.getPoints(100);

        this.curveMesh = this.buildCurve();
        this.track = new THREE.PlaneGeometry( 1, 1, 300, 1 );
        this.trackMesh = this.buildTrack();
        console.log(this.trackMesh.geometry.getAttribute('position'));

        this.add(this.curveMesh);
        this.add(this.trackMesh);
    }

    buildCurve() {
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(this.points), this.curveMaterial);
      line.computeLineDistances();
      return line;
    }

    buildTrack() {
      const plane = new THREE.Mesh(this.track, this.trackMaterial);
      const position = plane.geometry.getAttribute('position');
      const n = position.count/2; // We will define 2 points at a time, so the loop will only go until half the length of the array
      const w = this.width/2 // Multiply the tangent coordinate by this value so that the circuit will have the intended width
      
      for (let i=0; i<n; i++) {
          const point = this.curve.getPoint(i/(n-1));
          const tangent = this.curve.getTangent(i/(n-1));
          //console.log(point, tangent);
        
          // Pairing x with z because we actually want to define two points which belong to a line perpendicular to the tangent
          position.setXYZ(i, point.x-tangent.z*w, 0, point.z+tangent.x*w);
          position.setXYZ(i+n, point.x+tangent.z*w, 0, point.z-tangent.x*w);
      }
      return plane;
    }
}

export { MyTrack };
