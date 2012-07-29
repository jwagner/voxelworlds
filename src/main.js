(function(){

requires('jquery');
requires('gl-matrix');
requires('game-shim');
requires('webgl-debug');

provides('main');

var Loader = requires('loader').Loader,
    Clock = requires('clock').Clock;
    glUtils = requires('gl.utils');

var RESOURCES = [
    'shaders/voxel.vertex',
    'shaders/voxel.frag'
];

var loader = new Loader(),
    resources = loader.resources,
    c = $('canvas')[0];

if(glUtils.getContext(c) == null){
    return;
}

loader.onready = function() {
    console.log('ready');
};

loader.load(RESOURCES);

})();
