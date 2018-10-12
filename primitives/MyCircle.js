/**
 * MyCylinder
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

class MyCircle extends CGFobject {
  constructor(scene, radius = 1, slices) {
    super(scene);
    this.radius = radius;
    this.slices = slices;
    this.initBuffers();
  }



  initBuffers() {
    this.vertices = [];
    this.normals = [];
    this.indices = [];
    this.texCoords = [];

    let angleDiv = 2 * Math.PI / this.slices;
    let angle = 0;

    this.vertices.push(0, 0, 0);
    this.texCoords.push(0.5, 0.5);
    this.normals.push(0, 0, 1);

    for (let i = 0; i < this.slices; ++i) {
      var x = this.radius * Math.cos(angle);
      var y = this.radius * Math.sin(angle);

      this.vertices.push(x, y, 0);
      this.normals.push(0, 0, 1);
      this.texCoords.push((x + 1) / 2, 1 - (y + 1) / 2);

      angle += angleDiv;

      x = this.radius * Math.cos(angle);
      y = this.radius * Math.sin(angle);

      this.vertices.push(x, y, 0);
      this.normals.push(0, 0, 1);
      this.texCoords.push((x + 1) / 2, 1 - (y + 1) / 2);

      this.indices.push(2 * i + 1, 2 * i + 2, 0);
      this.indices.push(0, 2 * i + 2, 2 * i + 1);

      this.originalTex = this.texCoords.slice();
    }

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
  };

  updateTexCoords(length_s, lenght_t) {
    for (let i = 0; i < this.originalTex.length; i += 2) {
      this.texCoords[i] = this.originalTex[i] / length_s;
      this.texCoords[i + 1] = this.originalTex[i + 1] / lenght_t;
    }

    this.updateTexCoordsGLBuffers();
  }
}