(function(){
    
var voxel = provides('gl.voxel'),
    extend = requires('utils').extend,
    glutils = requires('gl.utils'),
    scene = requires('gl.scene');


voxel.Renderer = function(world) {
    this.world = world;
    this.buffers = {};
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
        var vertices = [],
            materials = this.world.materials,
            voxels = chunk.voxels,
            size = chunk.size,
            scale = chunk.voxel_scale,
            offset_x = chunk.position[0]*chunk.size*scale,
            offset_y = chunk.position[1]*chunk.size*scale,
            offset_z = chunk.position[2]*chunk.size*scale;
        for(var x = 0; x < size; x++) {
            var ox = offset_x + x*scale;
            for(var y = 0; y < size; y++) {
                var oy = offset_y + y*scale;
                for(var z = 0; z < size; z++) {
                    var oz = offset_z + z*scale,
                        i = x+y*size+z*size*size,
                        voxel = voxels[i],
                        material = materials[voxel],
                        color = material.color,
                        r = color[0],
                        g = color[1],
                        b = color[2];

                    if(voxel === 0) continue;
                    // top
                    vertices.push(ox);
                    vertices.push(oy+scale);
                    vertices.push(oz);
                    vertices.push(0);
                    vertices.push(1);
                    vertices.push(0);
                    vertices.push(r);
                    vertices.push(g);
                    vertices.push(b);

                    vertices.push(ox);
                    vertices.push(oy+scale);
                    vertices.push(oz+scale);
                    vertices.push(0);
                    vertices.push(1);
                    vertices.push(0);
                    vertices.push(r);
                    vertices.push(g);
                    vertices.push(b);

                    vertices.push(ox+scale);
                    vertices.push(oy+scale);
                    vertices.push(oz+scale);
                    vertices.push(0);
                    vertices.push(1);
                    vertices.push(0);
                    vertices.push(r);
                    vertices.push(g);
                    vertices.push(b);

                    vertices.push(ox+scale);
                    vertices.push(oy+scale);
                    vertices.push(oz);
                    vertices.push(0);
                    vertices.push(1);
                    vertices.push(0);
                    vertices.push(r);
                    vertices.push(g);
                    vertices.push(b);

                    vertices.push(ox);
                    vertices.push(oy+scale);
                    vertices.push(oz);
                    vertices.push(0);
                    vertices.push(1);
                    vertices.push(0);
                    vertices.push(r);
                    vertices.push(g);
                    vertices.push(b);

                    vertices.push(ox+scale);
                    vertices.push(oy+scale);
                    vertices.push(oz+scale);
                    vertices.push(0);
                    vertices.push(1);
                    vertices.push(0);
                    vertices.push(r);
                    vertices.push(g);
                    vertices.push(b);


                    // bottom
                    vertices.push(ox+scale);
                    vertices.push(oy);
                    vertices.push(oz+scale);
                    vertices.push(0);
                    vertices.push(-1);
                    vertices.push(0);
                    vertices.push(r);
                    vertices.push(g);
                    vertices.push(b);

                    vertices.push(ox);
                    vertices.push(oy);
                    vertices.push(oz+scale);
                    vertices.push(0);
                    vertices.push(-1);
                    vertices.push(0);
                    vertices.push(r);
                    vertices.push(g);
                    vertices.push(b);

                    vertices.push(ox);
                    vertices.push(oy);
                    vertices.push(oz);
                    vertices.push(0);
                    vertices.push(-1);
                    vertices.push(0);
                    vertices.push(r);
                    vertices.push(g);
                    vertices.push(b);

                    vertices.push(ox+scale);
                    vertices.push(oy);
                    vertices.push(oz);
                    vertices.push(0);
                    vertices.push(-1);
                    vertices.push(0);
                    vertices.push(r);
                    vertices.push(g);
                    vertices.push(b);

                    vertices.push(ox+scale);
                    vertices.push(oy);
                    vertices.push(oz+scale);
                    vertices.push(0);
                    vertices.push(-1);
                    vertices.push(0);
                    vertices.push(r);
                    vertices.push(g);
                    vertices.push(b);

                    vertices.push(ox);
                    vertices.push(oy);
                    vertices.push(oz);
                    vertices.push(0);
                    vertices.push(-1);
                    vertices.push(0);
                    vertices.push(r);
                    vertices.push(g);
                    vertices.push(b);

                    // left
                    vertices.push(ox);
                    vertices.push(oy+scale);
                    vertices.push(oz);
                    vertices.push(-1);
                    vertices.push(0);
                    vertices.push(0);
                    vertices.push(r);
                    vertices.push(g);
                    vertices.push(b);

                    vertices.push(ox);
                    vertices.push(oy);
                    vertices.push(oz);
                    vertices.push(-1);
                    vertices.push(0);
                    vertices.push(0);
                    vertices.push(r);
                    vertices.push(g);
                    vertices.push(b);

                    vertices.push(ox);
                    vertices.push(oy);
                    vertices.push(oz+scale);
                    vertices.push(-1);
                    vertices.push(0);
                    vertices.push(0);
                    vertices.push(r);
                    vertices.push(g);
                    vertices.push(b);


                    vertices.push(ox);
                    vertices.push(oy+scale);
                    vertices.push(oz);
                    vertices.push(-1);
                    vertices.push(0);
                    vertices.push(0);
                    vertices.push(r);
                    vertices.push(g);
                    vertices.push(b);

                    vertices.push(ox);
                    vertices.push(oy);
                    vertices.push(oz+scale);
                    vertices.push(-1);
                    vertices.push(0);
                    vertices.push(0);
                    vertices.push(r);
                    vertices.push(g);
                    vertices.push(b);

                    vertices.push(ox);
                    vertices.push(oy+scale);
                    vertices.push(oz+scale);
                    vertices.push(-1);
                    vertices.push(0);
                    vertices.push(0);
                    vertices.push(r);
                    vertices.push(g);
                    vertices.push(b);

                    // right
                    vertices.push(ox+scale);
                    vertices.push(oy+scale);
                    vertices.push(oz);
                    vertices.push(1);
                    vertices.push(0);
                    vertices.push(0);
                    vertices.push(r);
                    vertices.push(g);
                    vertices.push(b);

                    vertices.push(ox+scale);
                    vertices.push(oy);
                    vertices.push(oz+scale);
                    vertices.push(1);
                    vertices.push(0);
                    vertices.push(0);
                    vertices.push(r);
                    vertices.push(g);
                    vertices.push(b);

                    vertices.push(ox+scale);
                    vertices.push(oy);
                    vertices.push(oz);
                    vertices.push(1);
                    vertices.push(0);
                    vertices.push(0);
                    vertices.push(r);
                    vertices.push(g);
                    vertices.push(b);


                    vertices.push(ox+scale);
                    vertices.push(oy+scale);
                    vertices.push(oz);
                    vertices.push(1);
                    vertices.push(0);
                    vertices.push(0);
                    vertices.push(r);
                    vertices.push(g);
                    vertices.push(b);

                    vertices.push(ox+scale);
                    vertices.push(oy+scale);
                    vertices.push(oz+scale);
                    vertices.push(1);
                    vertices.push(0);
                    vertices.push(0);
                    vertices.push(r);
                    vertices.push(g);
                    vertices.push(b);

                    vertices.push(ox+scale);
                    vertices.push(oy);
                    vertices.push(oz+scale);
                    vertices.push(1);
                    vertices.push(0);
                    vertices.push(0);
                    vertices.push(r);
                    vertices.push(g);
                    vertices.push(b);
 

                    // front
                    vertices.push(ox);
                    vertices.push(oy+scale);
                    vertices.push(oz+scale);
                    vertices.push(0);
                    vertices.push(0);
                    vertices.push(1);
                    vertices.push(r);
                    vertices.push(g);
                    vertices.push(b);

                    vertices.push(ox);
                    vertices.push(oy);
                    vertices.push(oz+scale);
                    vertices.push(0);
                    vertices.push(0);
                    vertices.push(1);
                    vertices.push(r);
                    vertices.push(g);
                    vertices.push(b);

                    vertices.push(ox+scale);
                    vertices.push(oy);
                    vertices.push(oz+scale);
                    vertices.push(0);
                    vertices.push(0);
                    vertices.push(1);
                    vertices.push(r);
                    vertices.push(g);
                    vertices.push(b);


                    vertices.push(ox);
                    vertices.push(oy+scale);
                    vertices.push(oz+scale);
                    vertices.push(0);
                    vertices.push(0);
                    vertices.push(1);
                    vertices.push(r);
                    vertices.push(g);
                    vertices.push(b);

                    vertices.push(ox+scale);
                    vertices.push(oy);
                    vertices.push(oz+scale);
                    vertices.push(0);
                    vertices.push(0);
                    vertices.push(1);
                    vertices.push(r);
                    vertices.push(g);
                    vertices.push(b);

                    vertices.push(ox+scale);
                    vertices.push(oy+scale);
                    vertices.push(oz+scale);
                    vertices.push(0);
                    vertices.push(0);
                    vertices.push(1);
                    vertices.push(r);
                    vertices.push(g);
                    vertices.push(b);

                    // back
                    vertices.push(ox);
                    vertices.push(oy);
                    vertices.push(oz);
                    vertices.push(0);
                    vertices.push(0);
                    vertices.push(-1);
                    vertices.push(r);
                    vertices.push(g);
                    vertices.push(b);


                    vertices.push(ox);
                    vertices.push(oy+scale);
                    vertices.push(oz);
                    vertices.push(0);
                    vertices.push(0);
                    vertices.push(-1);
                    vertices.push(r);
                    vertices.push(g);
                    vertices.push(b);

                    vertices.push(ox+scale);
                    vertices.push(oy);
                    vertices.push(oz);
                    vertices.push(0);
                    vertices.push(0);
                    vertices.push(-1);
                    vertices.push(r);
                    vertices.push(g);
                    vertices.push(b);


                    vertices.push(ox+scale);
                    vertices.push(oy);
                    vertices.push(oz);
                    vertices.push(0);
                    vertices.push(0);
                    vertices.push(-1);
                    vertices.push(r);
                    vertices.push(g);
                    vertices.push(b);

                    vertices.push(ox);
                    vertices.push(oy+scale);
                    vertices.push(oz);
                    vertices.push(0);
                    vertices.push(0);
                    vertices.push(-1);
                    vertices.push(r);
                    vertices.push(g);
                    vertices.push(b);

                    vertices.push(ox+scale);
                    vertices.push(oy+scale);
                    vertices.push(oz);
                    vertices.push(0);
                    vertices.push(0);
                    vertices.push(-1);
                    vertices.push(r);
                    vertices.push(g);
                    vertices.push(b);

                }
            }
        }
        return new Float32Array(vertices);
    } 

};


})();

