class RotateCamera {

    constructor(camera, axis) {

        this.camera = camera;

        this.from = this.camera.position.slice(0);

        this.to = this.camera.target.slice(0);

        console.log('From: ', this.from, "To: ", this.to);
        console.log(this.camera);

        this.angle = Math.PI;

        this.step = 0;

        this.orbitTime = 1; //s

        this.axis = axis;

        this.elapsedTime = 0;

        this.waitForMove = true;

        this.firstIteration = true;
    }


    orbitCamera(time) {

        if (this.waitForMove)
            return;

        if (this.firstIteration) {


        console.log('From: ', this.from, "To: ", this.to);


            this.camera.setPosition(this.from);
            this.camera.setTarget(this.to);

            console.log(this.camera);

            this.firstIteration = false;
        }

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

        this.from = this.camera.position.slice();

        this.to = this.camera.target.slice();

        this.elapsedTime = 0;

        this.waitForMove = true;

        this.firstIteration = true;

    }

}