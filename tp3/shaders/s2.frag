varying vec3 vNormal;
varying vec2 vUv;

uniform vec3 color;
uniform sampler2D uSampler2;

void main() {
	vec4 tcolor = texture2D( uSampler2, vUv );

	gl_FragColor = tcolor;
}