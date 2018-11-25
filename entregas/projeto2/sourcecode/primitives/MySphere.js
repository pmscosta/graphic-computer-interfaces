/**
 * MySphere
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

class MySphere extends CGFobject
{
	constructor(scene, radius = 1, slices, stacks) 
	{
		super(scene);

		this.slices = slices;
		this.stacks = stacks;
        this.radius = radius;
		this.phi = (Math.PI * 2) / slices; 

		this.theta = (Math.PI * 2) / stacks;

		this.initBuffers();
	};

	initBuffers() 
	{
		this.vertices = [];

		this.indices = [];

		this.normals = [];

		this.texCoords = [];


		for (let i = 0; i <= this.stacks; i++) {

            let v = i / this.stacks;
			let phi = v * Math.PI;
			
			var z = this.radius * Math.cos(phi);

            for (let j = 0; j <= this.slices; j++) {

                let u = j / this.slices;
                let teta = u * Math.PI * 2;

                let vertex = [];
                vertex.x = this.radius * Math.cos(teta) * Math.sin(phi);
                vertex.y = this.radius * Math.sin(teta) * Math.sin(phi);
                vertex.z = z;
                
                this.vertices.push(vertex.x, vertex.y, vertex.z);

				this.normals.push(vertex.x, vertex.y, vertex.z);
				
                this.texCoords.push(u, v);
            }
		}
		
		//now we only add 1 vertice in each iteration
		for (let i = 0; i < this.slices; ++i) {
			for(let j = 0; j < this.stacks; ++j) {
				this.indices.push(
					(i+1)*(this.stacks+1) + j, i*(this.stacks+1) + j+1, i*(this.stacks+1) + j,
					i*(this.stacks+1) + j+1, (i+1)*(this.stacks+1) + j, (i+1)*(this.stacks+1) + j+1
				);
			}
		}

		this.originalTex = this.texCoords.slice();
		
		this.primitiveType=this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	};

	updateTexCoords(length_s, lenght_t) {
		for (let i = 0; i < this.originalTex.length; i += 2) {
		  this.texCoords[i] = this.originalTex[i] / length_s;
		  this.texCoords[i + 1] = this.originalTex[i + 1] / lenght_t;
		}

		this.updateTexCoordsGLBuffers();
	  };


};