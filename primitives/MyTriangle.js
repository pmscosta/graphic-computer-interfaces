/**
 * MyTriangle
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

class MyTriangle extends CGFobject
{
	constructor(scene, points, minS, maxS, minT, maxT) 
	{
		super(scene);
		this.minS = minS;
		this.maxS = maxS;
		this.minT = minT;
		this.maxT = maxT;
		this.x1 = points[0];
        this.y1 = points[1];
        this.z1 = points[2];
		this.x2 = points[3];
        this.y2 = points[4];
        this.z2 = points[5];
        this.x3 = points[6];
        this.y3 = points[7];
        this.z3 = points[8];
		this.initBuffers();
		
	};

	initBuffers() 
	{

		this.vertices = [
			this.x1, this.y1, this.z1, 
			this.x2, this.y2, this.z2,
			this.x3, this.y3, this.z3
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
