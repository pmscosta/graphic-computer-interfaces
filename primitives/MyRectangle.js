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
		this.initBuffers();
		
	};

	initBuffers() 
	{

		this.vertices = [
			this.x1, this.y2, 0, 
			this.x2, this.y2, 0,
			this.x2, this.y1, 0, 
			this.x1, this.y1, 0
		];
		
		this.indices = [
				0, 1, 2, 
				3, 2, 1
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
				this.minS, this.minT, 
				this.maxS, this.minT
		];
			
		this.primitiveType=this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	};
};
