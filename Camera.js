class RotateCamera {

    constructor(camera, axis) {

        this.camera = camera;

        this.from = this.camera.position.slice(0);

        this.to = this.camera.target.slice(0);

        this.angle = Math.PI;

        this.step = 0;

        this.orbitTime = 1; //s

        this.axis = axis;

        this.elapsedTime = 0;

        this.waitForMove = true;

        this.firstIteration = true;

        this.rotations = 0;

        this.side = 0;
    }

    change(camera) {

        this.camera = camera;

        let dir = this.camera.position[2] - this.camera.target[2];
        
        if (dir > 0 && this.side == 1 || dir < 0 && this.side == 0)
            this.camera.orbit(this.axis, this.angle);


    }

    reset(){
        let dir = this.camera.position[2] - this.camera.target[2];
        
        if (dir < 0)
            this.camera.orbit(this.axis, this.angle);
    }

    changePlayer(){
        this.camera.orbit(this.axis, this.angle);
    }


    orbitCamera(time) {

        if (this.waitForMove)
            return;

        time = time / 1000;

        this.lastTime = this.elapsedTime;

        this.elapsedTime += time;

        if (this.elapsedTime >= this.orbitTime) {
            this.makeStep(this.orbitTime - this.lastTime);
            this.finish();
            return;
        }

        this.makeStep(time);

    }

    makeStep(time) {
        this.step = (time * this.angle) / this.orbitTime;

        this.camera.orbit(this.axis, this.step);
    }

    finish() {

        this.elapsedTime = 0;

        this.waitForMove = true;

        this.side = (this.side + 1) % 2;

    }

}