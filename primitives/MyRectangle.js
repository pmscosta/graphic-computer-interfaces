/**
 * MyRectangle
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

class MyRectangle extends CGFobject
{
	constructor(scene, points, minS = 0, maxS = 1, minT = 0, maxT = 1) 
	{
		super(scene);
		this.minS = minS;
		this.maxS = maxS;
		this.minT = minT;
		this.maxT = maxT;
		this.x1 = points[0];
		this.y1 = points[1];
		this.x2 = points[2];
		this.y2 = points[3];

		this.maxS = this.x2 - this.x1;
		this.maxT = this.y2 - this.y1;
		this.initBuffers();
		
	};

	initBuffers() 
	{

		this.vertices = [
			this.x1, this.y1, 0, 
			this.x2, this.y1, 0,
			this.x2, this.y2, 0, 
			this.x1, this.y2, 0
		];
		
		this.indices = [
				0, 1, 2, 
				2, 3, 0
			];

		this.normals = [
				0, 0, 1,
				0, 0, 1,
				0, 0, 1,
				0, 0, 1
		];

		this.texCoords = [
				this.minS, this.maxT,
				this.maxS, this.maxT,
				this.maxS, this.minT, 
				this.minS, this.minT
		];

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
	  }
};
