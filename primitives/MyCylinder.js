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
		this.base = base;
		this.radius = 1;
		this.top = top; 
		this.heigth = heigth;
		this.ang = (Math.PI * 2) / slices;

		if(this.base > this.top){
			this.b1 = this.top;
			this.b2 = this.base;
		}else{
			this.b2 = this.base; 
			this.b1 = this.top;
		}

		this.stack_divider = this.heigth / stacks;

		this.baseCover = new MyCircle(this.scene, this.base, this.slices);
		this.topCover = new MyCircle(this.scene, this.top, this.slices);

		this.spacer = 1.0 / slices;

		this.initBuffers();
	};

	getRadius(z){
		return (((z / this.heigth) * this.b1) + ((this.heigth - z)/this.heigth) * this.b2);
	}

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
				var x1 = this.getRadius(z_distance) * Math.cos(angle1);
				var y1 = this.getRadius(z_distance) *  Math.sin(angle1); 

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

	display(){
		this.scene.pushMatrix();
			this.baseCover.display();
			super.display();
			this.scene.translate(0, 0, this.heigth);
			this.topCover.display();
		this.scene.popMatrix();

	}
};
