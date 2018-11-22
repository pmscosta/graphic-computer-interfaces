
attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform float normScale;
uniform float factor;

varying vec2 vTextureCoord;
varying vec4 coords;
varying vec4 normal;

uniform sampler2D uSampler2;

struct lightProperties {
    vec4 position;                  // Default: (0, 0, 1, 0)
    vec4 ambient;                   // Default: (0, 0, 0, 1)
    vec4 diffuse;                   // Default: (0, 0, 0, 1)
    vec4 specular;                  // Default: (0, 0, 0, 1)
    vec4 half_vector;
    vec3 spot_direction;            // Default: (0, 0, -1)
    float spot_exponent;            // Default: 0 (possible values [0, 128]
    float spot_cutoff;              // Default: 180 (possible values [0, 90] or 180)
    float constant_attenuation;     // Default: 1 (value must be >= 0)
    float linear_attenuation;       // Default: 0 (value must be >= 0)
    float quadratic_attenuation;    // Default: 0 (value must be >= 0)
    bool enabled;                   // Default: false
};

struct materialProperties {
    vec4 ambient;                   // Default: (0, 0, 0, 1)
    vec4 diffuse;                   // Default: (0, 0, 0, 1)
    vec4 specular;                  // Default: (0, 0, 0, 1)
    vec4 emission;                  // Default: (0, 0, 0, 1)
    float shininess;                // Default: 0 (possible values [0, 128])
};

uniform bool uLightEnabled;	// not being used
uniform bool uLightModelTwoSided;	// not being used

#define NUMBER_OF_LIGHTS 8

uniform vec4 uGlobalAmbient;

uniform lightProperties uLight[NUMBER_OF_LIGHTS];

uniform materialProperties uFrontMaterial;
uniform materialProperties uBackMaterial;

varying vec4 vFinalColor;

vec4 lighting(vec4 vertex, vec3 E, vec3 N) {

    vec4 result = vec4(0.0, 0.0, 0.0, 0.0);

    for (int i = 0; i < NUMBER_OF_LIGHTS; i++) {
        if (uLight[i].enabled) {

            float att = 1.0;
            float spot_effect = 1.0;
            vec3 L = vec3(0.0);

            if (uLight[i].position.w == 1.0) {
                L = (uLight[i].position - vertex).xyz;
                float dist = length(L);
                L = normalize(L);

                if (uLight[i].spot_cutoff != 180.0) {
                    vec3 sd = normalize(vec3(uLight[i].spot_direction));
                    float cos_cur_angle = dot(sd, -L);
                    float cos_inner_cone_angle = cos(radians(clamp(uLight[i].spot_cutoff, 0.0, 89.0)));

                    spot_effect = pow(clamp(cos_cur_angle/ cos_inner_cone_angle, 0.0, 1.0), clamp(uLight[i].spot_exponent, 0.0, 128.0));
                }

                att = 1.0 / (uLight[i].constant_attenuation + uLight[i].linear_attenuation * dist + uLight[i].quadratic_attenuation * dist * dist);

            } else {
                L = normalize(uLight[i].position.xyz);
            }

            float lambertTerm = max(dot(N, L), 0.0);

            vec4 Ia = uLight[i].ambient * uFrontMaterial.ambient;

            vec4 Id = uLight[i].diffuse * uFrontMaterial.diffuse * lambertTerm;

            vec4 Is = vec4(0.0, 0.0, 0.0, 0.0);

            if (lambertTerm > 0.0) {
                vec3 R = reflect(-L, N);
                float specular = pow( max( dot(R, E), 0.0 ), uFrontMaterial.shininess);

                Is = uLight[i].specular * uFrontMaterial.specular * specular;
            }

            if (uLight[i].position.w == 1.0)
               result += att * max(spot_effect * (Id + Is), Ia);
            else
               result += att * spot_effect * (Ia + Id + Is);
        }
    }

	result += uGlobalAmbient * uFrontMaterial.ambient + uFrontMaterial.emission;
    result = clamp(result, vec4(0.0), vec4(1.0));

    result.a = 1.0;
    return result;
}


vec3 getNormal(vec2 centralPoint){

  float NORMAL_OFF = 0.7;
  vec3 off = vec3(-NORMAL_OFF, 0, NORMAL_OFF);

  // s11 = Current
  float s11 = texture2D(uSampler2, vTextureCoord).x;

  // s01 = Left
  float s01 = texture2D(uSampler2, vec2(vTextureCoord.xy + off.xy)).x;

  // s21 = Right
  float s21 = texture2D(uSampler2, vec2(vTextureCoord.xy + off.zy)).x;

  // s10 = Below
  float s10 = texture2D(uSampler2, vec2(vTextureCoord.xy + off.yx)).x;

  // s12 = Above
  float s12 = texture2D(uSampler2, vec2(vTextureCoord.xy + off.yz)).x;

  vec3 va = normalize( vec3(off.z, 0.0, s21 - s11) );
  vec3 vb = normalize( vec3(0.0, off.z, s12 - s11) );

  vec3 normal = normalize( cross(va, vb) );

  return normal;


}


void main(){
		vTextureCoord = aTextureCoord;

		float height = texture2D(uSampler2, factor + vTextureCoord).x * normScale;

		vec3 temp_vertex = aVertexPosition + vec3(0, height, 0);

		vec4 vertex = uMVMatrix * vec4(temp_vertex, 1.0);

		vec3 N = getNormal(vTextureCoord);

		vec3 eyeVec = -vec3(vertex.xyz);

		vec3 E = normalize(eyeVec);

		vFinalColor = lighting(vertex, E, N);

		gl_Position = uPMatrix * vertex;
}
