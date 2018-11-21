
attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

varying vec2 vTextureCoord;

uniform sampler2D uSampler2;

void main() {
	vec3 offset=vec3(0.0,0.0,0.0);
	
	vTextureCoord = aTextureCoord;

	float height = texture2D(uSampler2, vTextureCoord).x * 0.2;

	vec3 vertex = aVertexPosition + vec3(0, height, 0);

	gl_Position = uPMatrix * uMVMatrix * vec4(vertex, 1.0);
}
