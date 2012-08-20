define(function(require, exports){

require('jquery');
require('game-shim');

var Loader = require('loader').Loader,
    Clock = require('clock').Clock,
    glUtils = require('gl/utils'),
    InputHandler = require('input').Handler,
    MouseController = require('cameracontroller').MouseController,
    scene = require('gl/scene'),
    mesh = require('gl/mesh'),
    glutils = require('gl/utils'),
    glvoxel = require('gl/voxel'),
    voxel = require('voxel'),
    getHashValue = require('utils').getHashValue,
    vec3 = require('gl-matrix').vec3,
    vec4 = require('gl-matrix').vec4,
    mat4 = require('gl-matrix').mat4,
    ShaderManager = require('gl/shader').Manager;


var RESOURCES = [
    'shaders/voxel.vertex',
    'shaders/voxel.frag',
    'shaders/solid.vertex',
    'shaders/solid.frag'
];

var loader = new Loader(),
    resources = loader.resources,
    shaders = new ShaderManager(resources),
    canvas = $('canvas')[0],
    input = new InputHandler(canvas),
    clock = new Clock(),
    graph = new scene.Graph(),
    mousecontroller = new MouseController(input, null),
    debug = getHashValue('debug', '0') !== '0',
    debug_element = $('#debug');

var cube, cube2;
function prepareScene(){
    window.world = new voxel.World({width: 8, height: 2, depth: 8, chunk_size: 32, scale: 0.5});
    voxel.random_world(window.world);
    //voxel.flat_world(window.world, 10);
    window.renderer = new glvoxel.Renderer(window.world);

    cube = new scene.Transform([
        new scene.Material(shaders.get('solid'), {color: vec4.create([0.5, 0.0, 0.0, 0.5])}, [
            new scene.SimpleMesh(new glUtils.VBO(mesh.cube(-0.5)))])
        ]);
    cube2 = new scene.Transform([
        new scene.Material(shaders.get('solid'), {color: vec4.create([0.0, 0.0, 1.0, 0.5])}, [
            new scene.SimpleMesh(new glUtils.VBO(mesh.cube(-0.5)))])
    ]);



    var shader = new scene.Material(shaders.get('voxel'), {}, [
            //new scene.SimpleMesh(new glutils.VBO(mesh.cube())),
            window.renderer
        ]),
        camera = new scene.Camera([
            shader,
            cube,
            //cube2
        ]),
        globals = new scene.Uniforms({
            sunDirection: vec3.normalize(vec3.create([0.1, 0.3, 0.5]))
        }, [camera]);
    window.camera = camera;
    camera.position[0] = 4*32*0.5;
    camera.position[1] = 6*32*0.5;
    camera.position[2] = 8*32*0.5;
    camera.pitch = Math.PI*0.25;
    graph.root.append(globals);
    mousecontroller.camera = camera;
    mousecontroller.velocity = 10;
    gl.clearColor(0.5, 0.6, 0.8, 0.0);
    //gl.enable(gl.BLEND);
    //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    graph.viewportWidth = canvas.width;
    graph.viewportHeight = canvas.height;
    return;
}

var add_block = false, delete_block = false;
input.onKeyDown = function(key) {
    if(key === 'Q'){
        delete_block = true;
    }
    if(key === 'E'){
        add_block = true;
    }
};

window.cposition = vec3.create();
window.clposition = vec3.create();
clock.ontick = function (td) {
    mousecontroller.tick(td);
    var ray = window.camera.getRay(),
        scale = window.world.chunk_options.scale;
    window.ray = ray;

    var aux = vec3.create([ray[3], ray[4], ray[5]]);
    vec3.scale(aux, 10);
    vec3.add(aux, ray);
    mat4.identity(cube2.matrix);
    mat4.translate(cube2.matrix, aux);

    vec3.scale(ray, 1.0/scale);
    var hit = window.world.ray_query(ray, 1024, window.cposition, window.clposition),
        voxel = window.world.voxel(window.cposition);

    if(hit){
        //debugger;
        mat4.identity(cube.matrix);
        mat4.translate(cube.matrix, vec3.add(vec3.scale(window.clposition, scale, aux), [0.5, 0.5, 0.5]));
        if(delete_block) {
            delete_block = false;
            window.world.voxel(window.cposition, 0);
        }
        else if(add_block) {
            add_block = false;
            window.world.voxel(window.clposition, 3);
        }
    }
    //debug_element.html('<h4>ray</h4>' +
                       //(hit ? 'hit' : 'miss') +
                       //'<br>' + Array.prototype.slice.call(ray).join(',') +
                       //'<br>' + Array.prototype.slice.call(window.cposition).join(',') +
                       //'<br>' + Array.prototype.slice.call(window.clposition).join(',') +
                       //'<br>' + voxel
                      //);
    graph.draw();
};

if(glUtils.getContext(canvas, {}, {debug: debug}) == null){
    //return;
}

loader.onready = function() {
    console.log('ready');
    prepareScene();
    clock.start(canvas);
};

loader.load(RESOURCES);

});
