uniform sampler2D uSampler1;
uniform float offset;

attribute float displacement;

varying vec2 vUv;

void main() {
	vUv = uv;
	vec4 tex = texture2D( uSampler1, uv );

	vec3 newPosition = position + normal * tex.b * offset;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
}
