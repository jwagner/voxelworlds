#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec4 color;

void main(){
    gl_FragColor = color;
    gl_FragColor = vec4(1.0, 1.0, 0.0, 0.5);
}
