class LinearAnimation extends Animation {
    constructor(scene, controlPoints, totalTime) {
        super(scene);

        this.controlPoints = controlPoints;

        this.numberOfPoints = this.controlPoints.length;

        this.totalTime = totalTime;

        this.position = [];

        this.totalDistance = this.calculateTotalDistance();

        this.velocity = this.totalDistance / this.totalTime;

        this.initialConfig();
    }


    isOver() {
        return this.finished;
    }



    initialConfig() {

        this.elapsedTime = 0;

        this.startPoint = 0;

        this.position = [...this.controlPoints[this.startPoint]];

        this.endPoint = this.startPoint + 1;

        this.finished = false;

        this.totalDistance = this.calculateTotalDistance();

        this.timeBetweenPoints = this.getTimeBetweenPonts(
            this.controlPoints[this.startPoint], this.controlPoints[this.endPoint]);

        this.dirVector = this.createDirectionalVector(
            this.controlPoints[this.startPoint], this.controlPoints[this.endPoint]);

        this.xyRot = Math.atan2(this.dirVector[0], this.dirVector[2]);

        this.yzRot = -Math.atan2(this.dirVector[1], this.dirVector[2]);

        if (this.dirVector[2] < 0)
            this.yzRot += Math.PI;


    }


    update(time) {

        if (this.finished) return;

        this.elapsedTime += time / 1000;

        if (this.elapsedTime >= this.timeBetweenPoints) {
            this.updatePoints();
            return;
        }

        this.position[0] += this.dirVector[0] * this.velocity * time / 1000;
        this.position[1] += this.dirVector[1] * this.velocity * time / 1000;
        this.position[2] += this.dirVector[2] * this.velocity * time / 1000;


    }

    updatePoints() {
        if (this.endPoint == this.numberOfPoints - 1) {
            this.finished = true;
        } else {
            this.startPoint++;
            this.endPoint++;

            this.elapsedTime = 0;
            this.timeBetweenPoints = this.getTimeBetweenPonts(
                this.controlPoints[this.startPoint],
                this.controlPoints[this.endPoint]);

            this.dirVector = this.createDirectionalVector(
                this.controlPoints[this.startPoint], this.controlPoints[this.endPoint]);

            this.xyRot = Math.atan2(this.dirVector[0], this.dirVector[2]);
            this.yzRot = -Math.atan2(this.dirVector[1], this.dirVector[2]);


            if (this.dirVector[2] < 0)
                this.yzRot += Math.PI;

        }
    }

    apply() {

        this.scene.translate(this.position[0], this.position[1], this.position[2]);
        this.scene.rotate(this.yzRot, 1, 0, 0);
        this.scene.rotate(this.xyRot, 0, 1, 0);

    }



    getTimeBetweenPonts(point1, point2) {
        return this.distanceBetweenTwoPoints(point1, point2) / this.velocity;
    }

    calculateTotalDistance() {
        let totalDistance = 0;

        for (let i = 0; i < this.numberOfPoints - 1; i++)
            totalDistance += this.distanceBetweenTwoPoints(
                this.controlPoints[i], this.controlPoints[i + 1]);

        return totalDistance;
    }

    distanceBetweenTwoPoints(point1, point2) {
        let dx = point2[0] - point1[0];
        let dy = point2[1] - point1[1];
        let dz = point2[2] - point1[2];

        let distance =
            Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2) + Math.pow(dz, 2));

        return distance;
    }

    vectorNorm(vector) {
        let norm = Math.sqrt(
            Math.pow(vector[0], 2) + Math.pow(vector[1], 2) +
            Math.pow(vector[2], 2));

        return norm;
    }

    normalizeVector(vector) {
        let norm = this.vectorNorm(vector);

        vector[0] /= norm;
        vector[1] /= norm;
        vector[2] /= norm;
    }

    createDirectionalVector(startPoint, endPoint) {
        let dirVector = [
            endPoint[0] -
            startPoint[0],
            endPoint[1] -
            startPoint[1],
            endPoint[2] -
            startPoint[2]
        ];

        this.normalizeVector(dirVector);

        return dirVector;
    }
}