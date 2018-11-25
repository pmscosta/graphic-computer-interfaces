
class Animation {

    /**
     * @param scene 
     */
    constructor(scene) {
        this.scene=scene;
        this.transformation = new Transformation(scene);
        this.elapsedTime = 0; 
    }

    
    /**
     * Applies animation to the scene
     */
    apply(){
        this.scene.pushMatrix(); 
            this.scene.multMatrix(this.transformation.getMatrix());
        this.scene.popMatrix();
    }

}