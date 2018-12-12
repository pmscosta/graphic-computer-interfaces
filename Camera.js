class RotateCamera{

    constructor(camera, finalPosition, axis){

        this.camera = camera;

        this.initialPosition = { from: camera.position, to: camera.target };

        this.finalPosition = finalPosition;

        console.log(this.initialPosition, this.finalPosition);

        this.angle = Math.PI;

        this.step = 0;

        this.orbitTime = 2; //s

        this.axis = axis;

        this.elapsedTime = 0; 
    }


    orbitCamera(time){
        
        this.elapsedTime += time;

        if(this.elapsedTime >= this.orbitTime){
            this.finish();
            return;
        }

        this.step = (time * this.angle) / this.orbitTime;
        
        this.camera.orbit(this.axis, this.step);

    }

    finish(){
        let temp = this.initialPosition; 

        this.initialPosition = this.finalPosition; 

        this.finalPosition = temp;

        this.elapsedTime = 0; 

    }

}