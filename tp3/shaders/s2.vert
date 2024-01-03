uniform float time;
uniform float offset;
uniform float radius;

varying vec2 vUv;

void main() {
	vUv = uv;
	float nRadius = radius + sin(time) * offset;
	float xVal = (position.x / radius);
	float yVal = (position.y / radius);
	vec3 nPosition = vec3(xVal * nRadius, yVal * nRadius, position.z);

	gl_Position = projectionMatrix * modelViewMatrix * vec4( nPosition, 1.0 );
}
