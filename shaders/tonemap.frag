precision highp float;

varying vec2 screenPosition;
uniform sampler2D blur0;
uniform sampler2D blur1;
uniform sampler2D albedo;


void main(){
    vec4 blured0 = texture2D(blur0, screenPosition);
    vec4 blured1 = texture2D(blur1, screenPosition);
    vec4 color = texture2D(albedo, screenPosition);
    float d0 = (blured0.a-color.a)/blured0.a;
    float d1 = (blured1.a-color.a)/blured1.a;
    vec3 linear;
    float x = d0;
    float shading = clamp(x*0.5+x/(1.0+x*x), -0.07, -0.05)*5.0+0.5;
    linear = (color.rgb)*shading;
    vec3 srgb = (linear*(6.2*linear+.5))/(linear*(6.2*linear+1.7)+0.06);
    srgb = pow(linear, vec3(1.0 / 2.2));
    /*srgb = vec3(shading);*/
    /*srgb = vec3(-d1);*/
    /*srgb = mix(color.rgb*shading, blured1.rgb, clamp(color.a*0.02, 0.0, 1.0));*/
    gl_FragColor = vec4(srgb, 1.0);
}
