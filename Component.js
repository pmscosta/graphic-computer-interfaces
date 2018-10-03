
class Component {
  constructor(scene) {
      this.scene=scene;
      this.transformation = new Transformation(this.scene);
      this.componentChildren = [];
      this.primitiveChildren = [];
      this.textures = [];
      this.materials = [];
      this.id;
  }

}