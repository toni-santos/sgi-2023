uniform sampler2D uSampler1;
uniform float offset;

attribute float displacement;

varying vec2 vUv;
varying float altPos;

void main() {
	vUv = uv;
	vec4 tex = texture2D( uSampler1, uv );
	vec3 newPosition = position + normal * tex.b * offset;
    altPos = (newPosition).z * 3.6;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
}
