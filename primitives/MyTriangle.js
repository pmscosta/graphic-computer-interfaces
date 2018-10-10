/**
 * MyTriangle
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

class MyTriangle extends CGFobject {
  constructor(scene, points, minS = 0, maxS = 1, minT = 0, maxT = 1) {
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

  initBuffers() {
    this.vertices = [
      this.x1, this.y1, this.z1, this.x2, this.y2, this.z2, this.x3, this.y3,
      this.z3
    ];

	this.texCoords = [];

    this.indices = [0, 1, 2];

    this.normals = [0, 0, 1, 0, 0, 1, 0, 0, 1];

    this.calculateTexCoords();

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
  };

  calculateTexCoords() {
    var b = Math.sqrt(
        Math.pow((this.x2 - this.x1), 2) + Math.pow((this.y2 - this.y1), 2) +
        Math.pow((this.z2 - this.z1), 2));

    var c = Math.sqrt(
        Math.pow((this.x3 - this.x2), 2) + Math.pow((this.y3 - this.y2), 2) +
        Math.pow((this.z3 - this.z2), 2));

    var a = Math.sqrt(
        Math.pow((this.x1 - this.x3), 2) + Math.pow((this.y1 - this.y3), 2) +
        Math.pow((this.z1 - this.z3), 2));

	var cosb = (a * a - b * b + c * c) / (2 * a + c);

	var ang_b = Math.acos(cosb);
	
	var P0 = [c - a*cosb, 1 - a * Math.sin(ang_b)];
	var P1 = [0, 1]; 
	var P2 = [c, 1];

	this.texCoords.push(P0[0], P0[1], P1[0], P1[1], P2[0], P2[1]);

	this.originalTex = this.texCoords.slice();
	
  };

  updateTexCoords(length_s, lenght_t) {
	for (let i = 0; i < this.originalTex.length; i += 2) {
	  this.texCoords[i] = this.originalTex[i] / length_s;
	  this.texCoords[i + 1] = this.originalTex[i + 1] / lenght_t;
	}

	this.updateTexCoordsGLBuffers();
  };
};
