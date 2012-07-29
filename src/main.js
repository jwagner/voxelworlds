(function(){

requires('jquery');
requires('gl-matrix');
requires('game-shim');
requires('webgl-debug');

provides('main');

var Loader = requires('loader').Loader,
    Clock = requires('clock').Clock;

var RESOURCES = [
    'shaders/voxel.vertex',
    'shaders/voxel.frag'
];

var loader = new Loader(),
    resources = loader.resources,
    c = $('canvas')[0];

loader.onready = function() {
};

loader.load(RESOURCES);

})();
