uniform sampler2D uSampler1;

attribute float displacement;

varying vec2 vUv;

void main() {
	vUv = uv;
	vec4 tex = texture2D( uSampler1, uv );

	vec3 newPosition = position + normal * tex.b * 0.2;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
}
