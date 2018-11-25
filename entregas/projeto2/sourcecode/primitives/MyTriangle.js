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
    this.b = Math.sqrt(
        Math.pow((this.x2 - this.x1), 2) + Math.pow((this.y2 - this.y1), 2) +
        Math.pow((this.z2 - this.z1), 2));

    this.c = Math.sqrt(
        Math.pow((this.x3 - this.x2), 2) + Math.pow((this.y3 - this.y2), 2) +
        Math.pow((this.z3 - this.z2), 2));

    this.a = Math.sqrt(
        Math.pow((this.x1 - this.x3), 2) + Math.pow((this.y1 - this.y3), 2) +
        Math.pow((this.z1 - this.z3), 2));

    this.cosb = (this.a * this.a - this.b * this.b + this.c * this.c) / (2 * this.a * this.c);

    this.sinb = Math.sqrt(1 - Math.pow(this.cosb, 2));
  };

  updateTexCoords(length_s, lenght_t) {
    
    this.texCoords =[
      (this.c - this.a * this.cosb)/length_s, 
      (lenght_t - this.a * this.sinb)/lenght_t,
      0, 1,
      this.c/length_s, 1
    ];

    this.updateTexCoordsGLBuffers();
  };
};
