define(function(require, exports, module){
    

require('webgl-debug');
var $ = require('jquery');

var glUtils = exports;

glUtils.Texture2D = function Texture2D(image) {
    this.texture = gl.createTexture();
    this.bindTexture();
    this.unit = -1;
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT );
    gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT );
    gl.generateMipmap(gl.TEXTURE_2D);
};
glUtils.Texture2D.prototype = {
    bindTexture: function(unit) {
        if(unit !== undefined){
            gl.activeTexture(gl.TEXTURE0+unit);
            this.unit = unit;
        }
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
    },
    unbindTexture: function() { 
        gl.activeTexture(gl.TEXTURE0+this.unit);
        gl.bindTexture(gl.TEXTURE_2D, null);
    },
    uniform: function (location) {
        gl.uniform1i(location, this.unit);
    },
    equals: function(value) {
        return this.unit === value;
    },
    set: function(obj, name) {
        obj[name] = this.unit;
    } 
};

glUtils.VBO = function VBO(data){
    console.time('createBuffer');
    this.buffer = gl.createBuffer();
    console.timeEnd('createBuffer');
    this.bind();
    console.time('bufferData');
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    console.timeEnd('bufferData');
    this.unbind();
    console.log(this.length);
    this.length = data.length;
};
glUtils.VBO.prototype = {
    bind: function() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    },
    unbind: function() {
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    },
    draw: function(mode) {
        gl.drawArrays(mode, 0, this.length/3);
    },
    free: function(mode) {
        gl.deleteBuffer(this.buffer);
        delete this.buffer;
    }
};

glUtils.FBO = function FBO(width, height, format){
    this.width = width;
    this.height = height;

    this.framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);

    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, format || gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    this.depth = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.depth);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depth);

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    this.unit = -1;
};
glUtils.FBO.prototype = $.extend({}, glUtils.Texture2D.prototype, {
    bind: function () {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    },
    unbind: function() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
});


glUtils.getContext = function (canvas, context_options, options) {
    var upgrade = 'Try upgrading to the latest version of firefox or chrome.';
    if(!canvas.getContext){
        glUtils.onerror(canvas, 'canvas is not supported by your browser. ' +
             upgrade, 'no-canvas');
        return;
    }

    context_options = $.extend({}, context_options, {
        alpha: false,
        depth: true,
        stencil: false,
        antialias: true,
        premultipliedAlpha: false,
        preserveDrawingBuffer: false
    }); 

    window.gl = canvas.getContext('webgl', context_options);
    if(window.gl == null){
        window.gl = canvas.getContext('experimental-webgl', context_options);
        if(window.gl == null){
            glUtils.onerror(canvas, 'webgl is not supported by your browser. ' +
                 upgrade, 'no-webgl');
            return;
        }
    }

    if(options.vertex_texture_units && gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) < options.vertex_texture_units){
        glUtils.onerror(canvas, 'This demo needs at least two vertex texture units which are not supported by your browser. ' +
              upgrade, 'no-vertext-texture-units');
        return;
    }

    if(options.texture_float && gl.getExtension('OES_texture_float') == null){
        glUtils.onerror(canvas, 'This demo needs float textures for HDR rendering which is not supported by your browser. ' +
                upgrade, 'no-OES_texture_float');
        return;
    }

    if(options.standard_derivatives && gl.getExtension('OES_standard_derivatives') == null){
        glUtils.onerror(canvas, 'This demo need the standard deriviates extensions for WebGL which is not supported by your Browser.' +
                upgrade, 'no-OES_standard_derivatives');

    }

    if(window.WebGLDebugUtils && options.debug){
        window.gl = WebGLDebugUtils.makeDebugContext(gl);
        console.log('running in debug context');
    }

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    gl.lost = false;
    canvas.addEventListener('webglcontextlost', function () {
        alert('lost webgl context');
    }, false);
    canvas.addEventListener('webglcontextrestored', function () {
        alert('restored webgl context - reloading!');
        window.location.reload();
    }, false);

    return window.gl;
};

glUtils.fullscreen = function (canvas, scene, parent, onresize) {
    function resize() {
        var $element = $(document.fullscreenElement == canvas && canvas || parent || canvas),
            height = $element.height(),
            width = $element.width(),
            update = false;
        if(canvas.width != width){
            canvas.width = scene.viewportWidth = width;
            update = true;
        }
        if(canvas.height != height){
            canvas.height = scene.viewportHeight = height;
            update = true;
        }
        if(!update) return;
        if(onresize) onresize(width, height);
        scene.draw();
    }
    var t;
    function throttledResize(){
        window.clearTimeout(t);
        t = window.setTimeout(resize, 500);
    }
    window.addEventListener('resize', throttledResize, false);
    canvas.ownerDocument.addEventListener('fullscreenchange', throttledResize, false);
    resize();
};

glUtils.onerror = function(){
};


});
