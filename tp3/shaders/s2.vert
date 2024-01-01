uniform float time;
uniform float offset;

varying vec2 vUv;

void main() {
	vUv = uv;

	vec3 newPosition = position + normal * sin(time) * offset;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
}
