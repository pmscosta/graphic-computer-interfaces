class LinearAnimation extends Animation {

    constructor(scene, controlPoints, totalTime) {

        super(scene);
        this.controlPoints = controlPoints;
        this.numberOfPoints = this.controlPoints.length;
        this.totalTime = totalTime;
        this.timeBetweenPoints = this.totalTime / this.numberOfPoints;
        this.totalDistance = this.calculateTotalDistance();
        this.velocity = this.totalDistance / this.totalTime;

        this.startPoint = 0;
        this.position = [this.controlPoints[this.startPoint][0], this.controlPoints[this.startPoint][1], this.controlPoints[this.startPoint][2]];
        this.endPoint = this.startPoint + 1;

    }


    calculateTotalDistance() {

        let totalDistance = 0;

        for (let i = 0; i < this.numberOfPoints - 1; i++)
            totalDistance += distanceBetweenTwoPoints(this.controlPoints[i], this.controlPoints[i + 1]);

        return totalDistance;
    }

    distanceBetweenTwoPoints(point1, point2) {

        let dx = point2[0] - point1[0];
        let dy = point2[1] - point1[1];
        let dz = point2[2] - point1[2];

        let distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2) + Math.pow(dz, 2));

        return distance;

    }

    vectorNorm(vector) {

        let norm = Math.sqrt(Math.pow(vector[0], 2) + Math.pow(vector[1], 2) + Math.pow(vector[2], 2));

        return norm;
    }

    update(time) {

        let distanceToRun = time * this.velocity;

        let dirVector = [this.controlPoints[this.endPoint][0] - this.controlPoints[this.startPoint][0],
            this.controlPoints[this.endPoint][1] - this.controlPoints[this.startPoint][1],
            this.controlPoints[this.endPoint][2] - this.controlPoints[this.startPoint][2]
        ];

        let dirNorm = this.vectorNorm(dirVector);

        let ratio = dirNorm / distanceToRun;

        let x_dist = dirVector[0] / ratio;
        let y_dist = dirVector[1] / ratio;
        let z_dist = dirVector[2] / ratio;

        this.position[0] += x_dist;
        this.position[1] += y_dist;
        this.position[2] += z_dist;

        this.transformation.translate(this.position[0], this.position[1], this.position[2]);

        if (this.position[0] >= this.controlPoints[this.endPoint][0] &&
            this.position[1] >= this.controlPoints[this.endPoint][1] &&
            this.position[2] >= this.controlPoints[this.endPoint][2]) {
            this.startPoint++;
            this.endPoint++;
        }


    }


}