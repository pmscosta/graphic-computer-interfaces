var DEGREE_TO_RAD = Math.PI / 180;
class CircularAnimation extends Animation{
    /**
     * @param  {} scene 
     * @param  {} center Center of the circular animation
     * @param  {} radius Radius of the animation
     * @param  {} initialAngle Initial angle for the element
     * @param  {} rotAngle Total angle to rotate
     * @param  {} totalTime Total time of the animation
     * 
     */
    constructor(scene, center, radius, initialAngle, rotAngle, totalTime){

        super(scene);
        this.center = center.split(" ").map(Number);
        this.radius = radius;
        this.initialAngle = initialAngle*DEGREE_TO_RAD;
        this.currentAngle =this.initialAngle;
        this.rotAngle = rotAngle*DEGREE_TO_RAD; 
        this.totalTime = totalTime;
        this.intervalAngle = this.rotAngle/this.totalTime;
        this.finished = false;
    }   


    
    /**
     * Resets initial configurations of the animation
     */
    initialConfig() {
        this.elapsedTime = 0;

        this.currentAngle = this.initialAngle;

        this.finished = false;
    }

    /*
    Checks if the animation is finished
    */
    isOver(){
        return this.finished;
      }

    /**
     * Applies transformation to the element
     */
    apply(){

        this.scene.translate(this.center[0], this.center[1], this.center[2]);

        this.scene.translate(
                this.radius*Math.sin(this.currentAngle+ this.initialAngle),
                0,
                this.radius*Math.cos(this.currentAngle+ this.initialAngle));

        this.scene.rotate(Math.PI / 2 + this.initialAngle + this.currentAngle, 0, 1, 0);
        
    }
    /**
     * Updates angle to rotate on next iteration of apply()
     * @param  {} time Current time
     */
    update(time){
        if(this.finished) return;

        this.elapsedTime += time/1000;
        this.currentAngle+=time/1000 * this.intervalAngle;
        if(this.elapsedTime>=this.totalTime)
            this.finished = true;
     
    }
}