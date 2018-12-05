/**
 * MyRectangle
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

class MyRectangle extends CGFobject {
	constructor(scene, points, texAngle = 0, minS = 0, maxS = 1, minT = 0, maxT = 1) {
		super(scene);
		this.minS = minS;
		this.maxS = maxS;
		this.minT = minT;
		this.maxT = maxT;
		this.x1 = points[0];
		this.y1 = points[1];
		this.x2 = points[2];
		this.y2 = points[3];
		this.texAngle = texAngle * DEGREE_TO_RAD;
		console.log(points);

		this.maxS = this.x2 - this.x1;
		this.maxT = this.y2 - this.y1;
		this.initBuffers();

	};

	initBuffers() {

		this.vertices = [
			this.x1, this.y1, 0,
			this.x2, this.y1, 0,
			this.x2, this.y2, 0,
			this.x1, this.y2, 0
		];

		console.log(this.vertices);

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
			0, 1, 
			//1 , 1
			Math.cos(this.texAngle), Math.sin(this.texAngle) +1 ,
			//1, 0
			Math.cos(this.texAngle) + Math.sin(this.texAngle), Math.sin(this.texAngle) - Math.cos(this.texAngle) + 1, 
			//0, 0
			Math.sin(this.texAngle), 1- Math.cos(this.texAngle)
		];


		this.originalTex = this.texCoords.slice();

		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	};

	updateTexCoords(length_s, lenght_t) {
		/* 1
				lenght_t *= Math.sin(this.texAngle);
				length_s *= Math.cos(this.texAngle); */

		/* 		for (let i = 0; i < this.originalTex.length; i += 2) {
				  this.texCoords[i] = (this.originalTex[i] / length_s) //* Math.cos(this.texAngle);
				  this.texCoords[i + 1] = (this.originalTex[i + 1] / lenght_t ) //* Math.sin(this.texAngle);
				} */


	/* 	for (let i = 0; i < this.originalTex.length - 1; i += 2) {
			this.texCoords[i] = this.originalTex[i] * Math.cos(this.texAngle) - this.originalTex[i + 1] * Math.sin(this.texAngle);
			this.texCoords[i + 1] = (this.originalTex[i] * Math.sin(this.texAngle) + this.originalTex[i + 1] * Math.cos(this.texAngle));
		} */

		this.updateTexCoordsGLBuffers();
	}
};