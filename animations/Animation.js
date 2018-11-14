class Animation {

    constructor(scene) {
        this.transformation = new Transformation(scene);
        this.elapsedTime = 0; 
    }

    apply(){
        this.scene.pushMatrix(); 
            this.scene.multMatrix(this.transformation.getMatrix());
        this.scene.popMatrix();
    }

    update(time) {};

}