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


			for(let j = 0; j <= this.stacks; j++){

			var ang_theta = j * this.theta;
			var z1 = this.radius * Math.sin(ang_theta);

			for(let i = 0; i < this.slices; i++){

			    var ang_phi = this.phi * i; 
			    

				var x1 = this.radius *  Math.cos(ang_theta) * Math.cos(ang_phi);
				var y1 = this.radius * Math.cos(ang_theta) * Math.sin(ang_phi); 
                
                
				this.vertices.push(x1, y1, z1);
				this.normals.push(x1, y1, z1);
				var u = 0.5 + (Math.atan2(z1, x1) /  (2 * Math.PI));
				var v = 0.5 - (Math.asin(y1) / Math.PI);
				this.texCoords.push(u, v);


			}
		}

		//now we only add 1 vertice in each iteration

		for(let i = 0; i < (this.stacks * this.slices); i++){
            /* 
                We didn't need to test this before
                because the starting point on a full rotation
                of the prism, aka the vertice on with y = 0, does not 
                have its value duplicated, so we need to subtract
            */
	   	    if( (i +1) % this.slices == 0){
                this.indices.push(i, i + 1 - this.slices, i + this.slices);
                this.indices.push(i +1 - this.slices, i +1, i + this.slices);
		    }
		    else{
            this.indices.push(i, i+1, i + this.slices);
            this.indices.push(i+1, i +1 + this.slices, i + this.slices);
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

	display(){
		this.scene.pushMatrix();
		this.scene.rotate(Math.PI / 2, 1, 0, 0); 
		super.display();
		this.scene.popMatrix();
	}
};