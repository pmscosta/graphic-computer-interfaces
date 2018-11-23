#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;

varying vec4 vFinalColor;

uniform sampler2D uSampler;
uniform float texScale;
uniform sampler2D uSampler2;

void main() {
	vec4 color = texture2D(uSampler, vTextureCoord *  texScale);

	gl_FragColor = color * vFinalColor;
}
