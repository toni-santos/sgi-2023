varying vec3 vNormal;
varying vec2 vUv;
varying float altPos;

uniform vec3 color;
uniform sampler2D uSampler2;
uniform sampler2D uSampler3;

void main() {
	vec3 tcolor = texture2D( uSampler2, vUv ).rgb;
    vec3 altColor = texture2D( uSampler3, vec2(0.0, altPos) ).rgb;
	gl_FragColor = vec4(tcolor * 0.3 + altColor * 0.7, 1.0);
}