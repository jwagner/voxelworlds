define(function(require, exports, module){
    
var voxel = exports,
    extend = require('utils').extend,
    glutils = require('gl/utils'),
    scene = require('gl/scene');


voxel.Renderer = function(world) {
    this.world = world;
    this.buffers = {};
    
    this._mesh_generation_buffer = null;
};
voxel.Renderer.prototype = {
    visit: function(graph) {

        var shader = graph.getShader(),
            position = shader.getAttribLocation('position'),
            normal = shader.getAttribLocation('normal'),
            color = shader.getAttribLocation('color'),
            update = true;

        graph.pushUniforms();
        graph.uniforms.scale = this.world.scale;

        for(var i = 0; i < this.world.chunks.length; i++) {
            var chunk = this.world.chunks[i];
            if(chunk.nonempty_voxels === 0) continue;
            var mesh = this.buffers[chunk.key];
            if(!mesh){
                var buffer = this.generate_mesh(chunk);
                //console.log(mesh);
                mesh = this.buffers[chunk.key] = {vbo: new glutils.VBO(buffer), version: chunk.version};
            }
            else if(mesh.version < chunk.version && update){
                console.time('free');
                mesh.vbo.free();
                console.timeEnd('free');
                var data = this.generate_mesh(chunk);
                mesh.vbo = new glutils.VBO(data);
                console.log('regenerating buffer');
                mesh.version = chunk.version;
                // update at most one mesh per frame
                update = false;
            }
            var vbo = mesh.vbo;

            graph.uniforms.offset = chunk.position;
            shader.uniforms(graph.uniforms);

            vbo.bind();
            var stride = 9;
            gl.enableVertexAttribArray(position);
            gl.vertexAttribPointer(position, 3, gl.UNSIGNED_BYTE, false, stride, 0);
            gl.enableVertexAttribArray(normal);
            gl.vertexAttribPointer(normal, 3, gl.BYTE, false, stride, 3);
            gl.enableVertexAttribArray(color);
            gl.vertexAttribPointer(color, 3, gl.UNSIGNED_BYTE, false, stride, 6);
            gl.drawArrays(gl.TRIANGLES, 0, vbo.length/9);
            vbo.unbind();
            // render chunk
        }
        graph.popUniforms();
    },
    generate_mesh: function(chunk){
        var materials = this.world.materials,
            voxels = chunk.voxels,
            size = chunk.size,
            scale = 1,
            mesh,
            m = 0; // mesh index;

        if(this._mesh_generation_buffer === null){
            //console.log('allocating buffer');
            this._mesh_generation_buffer = new Uint8Array(
                9 * // floats per vertex
                6 * // vertices per side
                6 * // sides per voxel
                size * size * size * // voxels per chunk
                0.5 // worst case is a 3d checkerboard so 50%
            );
            //console.log('allocating buffer.');
        }

        mesh = this._mesh_generation_buffer;

        for(var x = 0; x < size; x++) {
            var ox = x*scale;
            for(var y = 0; y < size; y++) {
                var oy = y*scale;
                for(var z = 0; z < size; z++) {
                    var oz = z*scale,
                        i = x+y*size+z*size*size,
                        voxel = voxels[i];
                    if(voxel === 0) continue;
                    var material = materials[voxel],
                        color = material.color,
                        r = color[0],
                        g = color[1],
                        b = color[2];


                    // top
                    if(y === size-1 || voxels[i+size] === 0){
                        mesh[m++]=(ox);
                        mesh[m++]=(oy+scale);
                        mesh[m++]=(oz);
                        mesh[m++]=(0);
                        mesh[m++]=(1);
                        mesh[m++]=(0);
                        mesh[m++]=(r);
                        mesh[m++]=(g);
                        mesh[m++]=(b);

                        mesh[m++]=(ox);
                        mesh[m++]=(oy+scale);
                        mesh[m++]=(oz+scale);
                        mesh[m++]=(0);
                        mesh[m++]=(1);
                        mesh[m++]=(0);
                        mesh[m++]=(r);
                        mesh[m++]=(g);
                        mesh[m++]=(b);

                        mesh[m++]=(ox+scale);
                        mesh[m++]=(oy+scale);
                        mesh[m++]=(oz+scale);
                        mesh[m++]=(0);
                        mesh[m++]=(1);
                        mesh[m++]=(0);
                        mesh[m++]=(r);
                        mesh[m++]=(g);
                        mesh[m++]=(b);


                        mesh[m++]=(ox+scale);
                        mesh[m++]=(oy+scale);
                        mesh[m++]=(oz);
                        mesh[m++]=(0);
                        mesh[m++]=(1);
                        mesh[m++]=(0);
                        mesh[m++]=(r);
                        mesh[m++]=(g);
                        mesh[m++]=(b);

                        mesh[m++]=(ox);
                        mesh[m++]=(oy+scale);
                        mesh[m++]=(oz);
                        mesh[m++]=(0);
                        mesh[m++]=(1);
                        mesh[m++]=(0);
                        mesh[m++]=(r);
                        mesh[m++]=(g);
                        mesh[m++]=(b);

                        mesh[m++]=(ox+scale);
                        mesh[m++]=(oy+scale);
                        mesh[m++]=(oz+scale);
                        mesh[m++]=(0);
                        mesh[m++]=(1);
                        mesh[m++]=(0);
                        mesh[m++]=(r);
                        mesh[m++]=(g);
                        mesh[m++]=(b);

                    }

                    // bottom
                    if(y === 0 || voxels[i-size] === 0){
                        mesh[m++]=(ox+scale);
                        mesh[m++]=(oy);
                        mesh[m++]=(oz+scale);
                        mesh[m++]=(0);
                        mesh[m++]=(-1);
                        mesh[m++]=(0);
                        mesh[m++]=(r);
                        mesh[m++]=(g);
                        mesh[m++]=(b);

                        mesh[m++]=(ox);
                        mesh[m++]=(oy);
                        mesh[m++]=(oz+scale);
                        mesh[m++]=(0);
                        mesh[m++]=(-1);
                        mesh[m++]=(0);
                        mesh[m++]=(r);
                        mesh[m++]=(g);
                        mesh[m++]=(b);

                        mesh[m++]=(ox);
                        mesh[m++]=(oy);
                        mesh[m++]=(oz);
                        mesh[m++]=(0);
                        mesh[m++]=(-1);
                        mesh[m++]=(0);
                        mesh[m++]=(r);
                        mesh[m++]=(g);
                        mesh[m++]=(b);


                        mesh[m++]=(ox+scale);
                        mesh[m++]=(oy);
                        mesh[m++]=(oz);
                        mesh[m++]=(0);
                        mesh[m++]=(-1);
                        mesh[m++]=(0);
                        mesh[m++]=(r);
                        mesh[m++]=(g);
                        mesh[m++]=(b);

                        mesh[m++]=(ox+scale);
                        mesh[m++]=(oy);
                        mesh[m++]=(oz+scale);
                        mesh[m++]=(0);
                        mesh[m++]=(-1);
                        mesh[m++]=(0);
                        mesh[m++]=(r);
                        mesh[m++]=(g);
                        mesh[m++]=(b);

                        mesh[m++]=(ox);
                        mesh[m++]=(oy);
                        mesh[m++]=(oz);
                        mesh[m++]=(0);
                        mesh[m++]=(-1);
                        mesh[m++]=(0);
                        mesh[m++]=(r);
                        mesh[m++]=(g);
                        mesh[m++]=(b);
                    }

                    // left
                    if(x === 0 || voxels[i-1] === 0){
                        mesh[m++]=(ox);
                        mesh[m++]=(oy+scale);
                        mesh[m++]=(oz);
                        mesh[m++]=(-1);
                        mesh[m++]=(0);
                        mesh[m++]=(0);
                        mesh[m++]=(r);
                        mesh[m++]=(g);
                        mesh[m++]=(b);

                        mesh[m++]=(ox);
                        mesh[m++]=(oy);
                        mesh[m++]=(oz);
                        mesh[m++]=(-1);
                        mesh[m++]=(0);
                        mesh[m++]=(0);
                        mesh[m++]=(r);
                        mesh[m++]=(g);
                        mesh[m++]=(b);

                        mesh[m++]=(ox);
                        mesh[m++]=(oy);
                        mesh[m++]=(oz+scale);
                        mesh[m++]=(-1);
                        mesh[m++]=(0);
                        mesh[m++]=(0);
                        mesh[m++]=(r);
                        mesh[m++]=(g);
                        mesh[m++]=(b);


                        mesh[m++]=(ox);
                        mesh[m++]=(oy+scale);
                        mesh[m++]=(oz);
                        mesh[m++]=(-1);
                        mesh[m++]=(0);
                        mesh[m++]=(0);
                        mesh[m++]=(r);
                        mesh[m++]=(g);
                        mesh[m++]=(b);

                        mesh[m++]=(ox);
                        mesh[m++]=(oy);
                        mesh[m++]=(oz+scale);
                        mesh[m++]=(-1);
                        mesh[m++]=(0);
                        mesh[m++]=(0);
                        mesh[m++]=(r);
                        mesh[m++]=(g);
                        mesh[m++]=(b);

                        mesh[m++]=(ox);
                        mesh[m++]=(oy+scale);
                        mesh[m++]=(oz+scale);
                        mesh[m++]=(-1);
                        mesh[m++]=(0);
                        mesh[m++]=(0);
                        mesh[m++]=(r);
                        mesh[m++]=(g);
                        mesh[m++]=(b);
                    }

                    // right
                    if(x === size-1 || voxels[i+1] === 0){
                        mesh[m++]=(ox+scale);
                        mesh[m++]=(oy+scale);
                        mesh[m++]=(oz);
                        mesh[m++]=(1);
                        mesh[m++]=(0);
                        mesh[m++]=(0);
                        mesh[m++]=(r);
                        mesh[m++]=(g);
                        mesh[m++]=(b);

                        mesh[m++]=(ox+scale);
                        mesh[m++]=(oy);
                        mesh[m++]=(oz+scale);
                        mesh[m++]=(1);
                        mesh[m++]=(0);
                        mesh[m++]=(0);
                        mesh[m++]=(r);
                        mesh[m++]=(g);
                        mesh[m++]=(b);

                        mesh[m++]=(ox+scale);
                        mesh[m++]=(oy);
                        mesh[m++]=(oz);
                        mesh[m++]=(1);
                        mesh[m++]=(0);
                        mesh[m++]=(0);
                        mesh[m++]=(r);
                        mesh[m++]=(g);
                        mesh[m++]=(b);


                        mesh[m++]=(ox+scale);
                        mesh[m++]=(oy+scale);
                        mesh[m++]=(oz);
                        mesh[m++]=(1);
                        mesh[m++]=(0);
                        mesh[m++]=(0);
                        mesh[m++]=(r);
                        mesh[m++]=(g);
                        mesh[m++]=(b);

                        mesh[m++]=(ox+scale);
                        mesh[m++]=(oy+scale);
                        mesh[m++]=(oz+scale);
                        mesh[m++]=(1);
                        mesh[m++]=(0);
                        mesh[m++]=(0);
                        mesh[m++]=(r);
                        mesh[m++]=(g);
                        mesh[m++]=(b);

                        mesh[m++]=(ox+scale);
                        mesh[m++]=(oy);
                        mesh[m++]=(oz+scale);
                        mesh[m++]=(1);
                        mesh[m++]=(0);
                        mesh[m++]=(0);
                        mesh[m++]=(r);
                        mesh[m++]=(g);
                        mesh[m++]=(b);
                    }

                    // front
                    if(z === size-1 || voxels[i+size*size] === 0){
                        mesh[m++]=(ox);
                        mesh[m++]=(oy+scale);
                        mesh[m++]=(oz+scale);
                        mesh[m++]=(0);
                        mesh[m++]=(0);
                        mesh[m++]=(1);
                        mesh[m++]=(r);
                        mesh[m++]=(g);
                        mesh[m++]=(b);

                        mesh[m++]=(ox);
                        mesh[m++]=(oy);
                        mesh[m++]=(oz+scale);
                        mesh[m++]=(0);
                        mesh[m++]=(0);
                        mesh[m++]=(1);
                        mesh[m++]=(r);
                        mesh[m++]=(g);
                        mesh[m++]=(b);

                        mesh[m++]=(ox+scale);
                        mesh[m++]=(oy);
                        mesh[m++]=(oz+scale);
                        mesh[m++]=(0);
                        mesh[m++]=(0);
                        mesh[m++]=(1);
                        mesh[m++]=(r);
                        mesh[m++]=(g);
                        mesh[m++]=(b);


                        mesh[m++]=(ox);
                        mesh[m++]=(oy+scale);
                        mesh[m++]=(oz+scale);
                        mesh[m++]=(0);
                        mesh[m++]=(0);
                        mesh[m++]=(1);
                        mesh[m++]=(r);
                        mesh[m++]=(g);
                        mesh[m++]=(b);

                        mesh[m++]=(ox+scale);
                        mesh[m++]=(oy);
                        mesh[m++]=(oz+scale);
                        mesh[m++]=(0);
                        mesh[m++]=(0);
                        mesh[m++]=(1);
                        mesh[m++]=(r);
                        mesh[m++]=(g);
                        mesh[m++]=(b);

                        mesh[m++]=(ox+scale);
                        mesh[m++]=(oy+scale);
                        mesh[m++]=(oz+scale);
                        mesh[m++]=(0);
                        mesh[m++]=(0);
                        mesh[m++]=(1);
                        mesh[m++]=(r);
                        mesh[m++]=(g);
                        mesh[m++]=(b);
                    }

                    // back
                    if(z === 0 || voxels[i-size*size] === 0){
                        mesh[m++]=(ox);
                        mesh[m++]=(oy);
                        mesh[m++]=(oz);
                        mesh[m++]=(0);
                        mesh[m++]=(0);
                        mesh[m++]=(-1);
                        mesh[m++]=(r);
                        mesh[m++]=(g);
                        mesh[m++]=(b);

                        mesh[m++]=(ox);
                        mesh[m++]=(oy+scale);
                        mesh[m++]=(oz);
                        mesh[m++]=(0);
                        mesh[m++]=(0);
                        mesh[m++]=(-1);
                        mesh[m++]=(r);
                        mesh[m++]=(g);
                        mesh[m++]=(b);

                        mesh[m++]=(ox+scale);
                        mesh[m++]=(oy);
                        mesh[m++]=(oz);
                        mesh[m++]=(0);
                        mesh[m++]=(0);
                        mesh[m++]=(-1);
                        mesh[m++]=(r);
                        mesh[m++]=(g);
                        mesh[m++]=(b);


                        mesh[m++]=(ox+scale);
                        mesh[m++]=(oy);
                        mesh[m++]=(oz);
                        mesh[m++]=(0);
                        mesh[m++]=(0);
                        mesh[m++]=(-1);
                        mesh[m++]=(r);
                        mesh[m++]=(g);
                        mesh[m++]=(b);

                        mesh[m++]=(ox);
                        mesh[m++]=(oy+scale);
                        mesh[m++]=(oz);
                        mesh[m++]=(0);
                        mesh[m++]=(0);
                        mesh[m++]=(-1);
                        mesh[m++]=(r);
                        mesh[m++]=(g);
                        mesh[m++]=(b);

                        mesh[m++]=(ox+scale);
                        mesh[m++]=(oy+scale);
                        mesh[m++]=(oz);
                        mesh[m++]=(0);
                        mesh[m++]=(0);
                        mesh[m++]=(-1);
                        mesh[m++]=(r);
                        mesh[m++]=(g);
                        mesh[m++]=(b);
                    }
                }
            }
        }
        if(m===0) return new Uint8Array();
        return new Uint8Array(mesh.buffer.slice(0, m));
    } 

};


});
