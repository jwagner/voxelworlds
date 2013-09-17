#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

varying vec3 vPosition;
varying vec3 vColor;
varying vec3 vNormal;
/*varying float vAmbient;*/

uniform vec3 sunDirection;
uniform vec3 eye;

void main(){
    float light = max(dot(vNormal, sunDirection), 0.0)*0.8+0.2;
    vec3 view = vPosition-eye;
    vec3 shaded = vColor*light;
    gl_FragColor = vec4(shaded, length(view));
}
