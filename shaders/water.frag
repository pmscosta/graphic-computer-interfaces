#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
varying vec4 coords;
varying vec4 normal;

uniform sampler2D uSampler;
uniform sampler2D uSampler2;

void main() {

	if(coords.x>0.0){
		gl_FragColor.rgb= abs(coords.xyz)/3.0;
		gl_FragColor.a=1.0;

	}else{
		gl_FragColor=normal;	
	}

	vec4 color = texture2D(uSampler, vTextureCoord);

	gl_FragColor = color;
}
