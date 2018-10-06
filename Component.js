
class Component {
  constructor(scene) {
      this.scene=scene;
      this.transformation = new Transformation(this.scene);
      this.componentChildren = [];
      this.primitiveChildren = [];
      this.texture = [];
      this.materials = [];
      this.id;
  }

}