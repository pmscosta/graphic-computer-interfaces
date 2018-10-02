var DEGREE_TO_RAD = Math.PI / 180;

class Transformation {
  constructor(scene) {
    this.scene = scene;
    this.scene.pushMatrix();
    this.scene.loadIdentity();
    this.matrix = this.scene.getMatrix();
    this.scene.popMatrix();
  }

  getMatrix() {
    return this.matrix;
  }

  translate(coords) {
    this.scene.pushMatrix();
    this.scene.setMatrix(this.matrix);
    this.scene.translate(coords[0], coords[1], coords[2]);
    this.matrix = this.scene.getMatrix();
    this.scene.popMatrix();
  }


  rotate(angle, axis) {
    var coords = {x: 0, y: 0, z: 0};

    coords[axis] = 1;
    this.scene.pushMatrix();
    this.scene.setMatrix(this.matrix);
    this.scene.rotate(angle * DEGREE_TO_RAD, coords.x, coords.y, coords.z);
    this.matrix = this.scene.getMatrix();
    this.scene.popMatrix();
  }


  scale(coords) {
    this.scene.pushMatrix();
    this.scene.setMatrix(this.matrix);
    this.scene.scale(coords[0], coords[1], coords[2]);
    this.matrix = this.scene.getMatrix();
    this.scene.popMatrix();
  }
}