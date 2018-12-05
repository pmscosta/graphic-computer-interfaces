#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;

varying vec4 vFinalColor;

uniform sampler2D uSampler;
uniform float factor;
uniform float texScale;
uniform sampler2D uSampler2;

void main() {

	float cena = factor * 0.2;

	vec4 color = texture2D(uSampler, texScale * vTextureCoord + cena);

	gl_FragColor = color * vFinalColor;
}
