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
            color = shader.getAttribLocation('color');

        shader.uniforms(graph.uniforms);

        for(var i = 0; i < this.world.chunks.length; i++) {
            var chunk = this.world.chunks[i];
            if(chunk.nonempty_voxels === 0) continue;
            var vbo = this.buffers[chunk.key];
            if(!vbo){
                var mesh = this.generate_mesh(chunk);
                console.log(mesh);
                vbo = this.buffers[chunk.key] = new glutils.VBO(mesh);
            }

            vbo.bind();
            var stride = 36;
            gl.enableVertexAttribArray(position);
            gl.vertexAttribPointer(position, 3, gl.FLOAT, false, stride, 0);
            gl.enableVertexAttribArray(normal);
            gl.vertexAttribPointer(normal, 3, gl.FLOAT, false, stride, 12);
            gl.enableVertexAttribArray(color);
            gl.vertexAttribPointer(color, 3, gl.FLOAT, false, stride, 24);
            gl.drawArrays(gl.TRIANGLES, 0, vbo.length/9);
            vbo.unbind();
            // render chunk
        }
    },
    generate_mesh: function(chunk){
        var materials = this.world.materials,
            voxels = chunk.voxels,
            size = chunk.size,
            scale = chunk.voxel_scale,
            offset_x = chunk.position[0]*chunk.size*scale,
            offset_y = chunk.position[1]*chunk.size*scale,
            offset_z = chunk.position[2]*chunk.size*scale,
            mesh,
            m = 0; // mesh index;

        if(this._mesh_generation_buffer === null){
            console.log('allocating buffer');
            this._mesh_generation_buffer = new Float32Array(
                9 * // floats per vertex
                6 * // vertices per side
                6 * // sides per voxel
                size * size * size * // voxels per chunk
                0.5 // worst case is a 3d checkerboard so 50%
            );
            console.log('allocating buffer.');
        }

        mesh = this._mesh_generation_buffer;

        for(var x = 0; x < size; x++) {
            var ox = offset_x + x*scale;
            for(var y = 0; y < size; y++) {
                var oy = offset_y + y*scale;
                for(var z = 0; z < size; z++) {
                    var oz = offset_z + z*scale,
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
        if(m===0) return new Float32Array();
        return new Float32Array(mesh.buffer.slice(0, m*4-4));
    } 

};


});
