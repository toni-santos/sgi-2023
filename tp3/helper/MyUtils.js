import * as THREE from "three";

function posMod(x, y) {
    return ((x % y) + y) % y;
}

function signedAngleTo(v1, v2) {
    const cross = new THREE.Vector3();
    cross.crossVectors(v1, v2);
    const angle = cross.y < 0 ? -v1.angleTo(v2) : v1.angleTo(v2);
    return angle;
}

export {posMod, signedAngleTo}