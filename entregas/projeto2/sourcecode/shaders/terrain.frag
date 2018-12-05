#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;


varying float useMask;

uniform sampler2D uSampler;
uniform sampler2D uSampler2;

void main() {

	if(useMask == 1.0){
		vec4 textureColor = texture2D(uSampler2, vTextureCoord);
		gl_FragColor = textureColor;
		
	}
	else{
		vec4 textureColor = texture2D(uSampler, vTextureCoord);
		gl_FragColor = textureColor;
	}
}
