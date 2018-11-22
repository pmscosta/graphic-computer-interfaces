var DEGREE_TO_RAD = Math.PI / 180;
class CircularAnimation extends Animation{

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

    apply(){
        this.scene.translate(this.center[0],this.center[1],this.center[2]);
        this.scene.translate(
        this.radius*Math.sin(this.currentAngle+ this.initialAngle),
        0,
        this.radius*Math.cos(this.currentAngle+ this.initialAngle));
        this.scene.rotate( this.initialAngle + this.currentAngle,0,1,0);

    }

    update(time){
        if(this.finished) return;

        this.elapsedTime += time/1000;
        this.currentAngle+=time/1000 * this.intervalAngle;
        if(this.elapsedTime>=this.totalTime)
            this.finished = true;
     
    }

    isOver(){
        return this.finished;
    }

    initialConfig(){
        this.currentAngle = this.initialAngle;
        
    }
}