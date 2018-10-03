/**
 * MyCylinder
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

class MyCylinder extends CGFobject
{
	constructor(scene, base,top,heigth,slices, stacks) 
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

		for(let j = 0; j <= this.stacks; j++){

			var z_distance = j * this.stack_divider;

			for(let i = 0; i <= this.slices; i++){
				
				var angle1 = this.ang * i; 
				var x1 = Math.cos(angle1);
				var y1 = Math.sin(angle1); 

				this.vertices.push(x1, y1, z_distance);
				this.texCoords.push(i * this.spacer, z_distance);
				this.normals.push(x1, y1, 0);

			}

		}
		
		//to make it to 1
		var offset = this.slices + 1;
		
		//now we only add 1 vertice in each iteration
		for(let i = 0; i < (this.stacks * offset); i++){
            /* 
                We didn't need to test this before
                because the starting point on a full rotation
                of the prism, aka the vertice on with y = 0, does not 
                have its value duplicated, so we need to subtract
            */
	   	    if( (i +1) % offset == 0){
                this.indices.push(i, i + 1 - offset, i + offset);
                this.indices.push(i +1 - offset, i +1, i + offset);
		    }
		    else{
            this.indices.push(i, i+1, i + offset);
            this.indices.push(i+1, i +1 + offset, i + offset);
		    }
		}
		
		this.primitiveType=this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	};
};
