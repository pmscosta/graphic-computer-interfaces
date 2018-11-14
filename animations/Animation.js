class Animation {

    constructor(scene) {
        this.scene=scene;
        this.transformation = new Transformation(scene);
        this.elapsedTime = 0; 
    }

    apply(){
        this.scene.pushMatrix(); 
            console.log(this.scene.getMatrix());
            this.scene.multMatrix(this.transformation.getMatrix());
            console.log(this.scene.getMatrix());
        this.scene.popMatrix();
    }

    update(time) {};

}