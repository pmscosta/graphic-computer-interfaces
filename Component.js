
class Component {
  constructor(scene) {
      this.scene=scene;
      this.transformation = new Transformation(this.scene);
      this.componentChildren = [];
      this.primitiveChildren = [];
      this.texture = [];
      this.materials = [];
      this.id;
      this.materialPos=0;
      this.animation=[];
      this.animationPos=0;
  }

  hasAnimations(){
    return this.animation.length > 0;
  }


}
