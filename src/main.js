define(function(require, exports){

require('jquery');
require('gl-matrix');
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
    ShaderManager = require('gl/shader').Manager;

var RESOURCES = [
    'shaders/voxel.vertex',
    'shaders/voxel.frag'
];

var loader = new Loader(),
    resources = loader.resources,
    shaders = new ShaderManager(resources),
    canvas = $('canvas')[0],
    input = new InputHandler(canvas),
    clock = new Clock(),
    graph = new scene.Graph(),
    mousecontroller = new MouseController(input, null),
    debug = getHashValue('debug', '0') !== '0';

function prepareScene(){
    window.world = new voxel.World({width: 8, height: 2, depth: 8, chunk_options: {size: 32}});
    voxel.random_world(window.world);
    //voxel.flat_world(window.world, 10);
    window.renderer = new glvoxel.Renderer(window.world);

    var shader = new scene.Material(shaders.get('voxel'), {}, [
            //new scene.SimpleMesh(new glutils.VBO(mesh.cube())),
            window.renderer
        ]),
        camera = new scene.Camera([shader]),
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
    gl.clearColor(0.5, 0.6, 0.8, 1.0);
    graph.viewportWidth = canvas.width;
    graph.viewportHeight = canvas.height;
    return;
}

clock.ontick = function (td) {
    mousecontroller.tick(td);
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
