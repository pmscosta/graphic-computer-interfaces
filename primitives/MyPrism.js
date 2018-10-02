/**
 * MyPrism
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

class MyPrism extends CGFobject
{
	constructor(scene, slices, stacks) 
	{
		super(scene);

		this.slices = slices;
		this.stacks = stacks;

		this.radius = 1;
		
		this.ang = (Math.PI * 2) / slices;

		this.stack_divider = 1.0 / stacks;

		this.spacer = 1.0 / slices;

		this.initBuffers();
	};

	initBuffers() 
	{
		this.vertices = [];

		this.indices = [];

		this.normals = [];

		this.texCoords = [];

		//First point, will be used to keep the last value
		var angle1 = 0;
		var x1 = 1;
		var y1 = 0;


		for(let j = 0; j <= this.stacks; j++){

			var z_distance = j * this.stack_divider;

			
			for(let i = 0; i < this.slices; i++){

				//vertices
				
				var angle1 = this.ang * i; 
				var x1 = Math.cos(angle1);
				var y1 = Math.sin(angle1); 

				var angle2 = this.ang * (i+1);
				var x2 = Math.cos(angle2);
				var y2 = Math.sin(angle2);

				this.vertices.push(x1, y1, z_distance);
				this.texCoords.push(i * this.spacer, z_distance);

				this.vertices.push(x2, y2, z_distance);
				this.texCoords.push((i+1) * this.spacer, z_distance);
				

				//normals

				var n_angle = (angle1 + angle2) / 2.0; 
				var n_x = Math.cos(n_angle); 
				var n_y = Math.sin(n_angle);

				this.normals.push(n_x, n_y, 0);
				this.normals.push(n_x, n_y, 0);


			}
		}

		//we added 2 vertices in each iteration slice of stacks

		for(let i = 0; i < (2 * this.stacks * this.slices); i += 2){

			this.indices.push(i, i+1, i + this.slices * 2);
			this.indices.push(i+1, i + 1 + this.slices * 2, i + this.slices *2);
				


		}
		
		this.primitiveType=this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	};
};
