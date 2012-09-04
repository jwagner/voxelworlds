require.config({
    baseUrl: '../src',
    paths: {
        "simplex-noise": "../lib/simplex-noise",
        "alea": "../lib/alea",
        "jquery": "../lib/jquery",
        "game-shim": "../lib/game-shim",
        "gl-matrix": "../lib/gl-matrix",
        "webgl-debug": "../lib/webgl-debug"
    }
});
require(['main']);
