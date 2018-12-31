class Piece extends CGFobject {
    /**
     * @param  {XML Scene} scene
     */
    constructor(scene, position, points) {
        super(scene);
        this.scene = scene;
        this.position = position || [0, 0];

        this.piece = new MyCylinder(this.scene, 0.12, 0.12, 0.1, 20, 20);

        this.mat = new CGFappearance(this.scene);
        this.mat.setAmbient(1, 1, 1, 1);
        this.mat.setDiffuse(1, 1, 1, 1);
        this.mat.setSpecular(1, 1, 1, 1);
        this.mat.setEmission(0, 0, 0, 0);
        this.mat.setShininess(100);
        this.animation = null;
        this.endPosition = null;
        this.parentPoints = points;
    };

    hasAnimation(){
        return this.animation == null;
    }

    display() {

        this.scene.pushMatrix();
        

        this.mat.apply();
        this.scene.translate(0.4 * this.position[0] + this.parentPoints[0] , 0 + this.parentPoints[1], 0.4 * this.position[1] + this.parentPoints[2]);
        this.scene.translate(0.2, 0, 0.2);
        if (this.animation != null)
        this.animation.apply();
        this.scene.rotate(-Math.PI / 2, 1, 0, 0);
        this.scene.registerForPick((this.position[0] + 1) * 10 + (this.position[1] + 1), this.piece);
        this.piece.display();
        this.scene.popMatrix();
    }

    update(time) {
        if (this.animation != null) {
            this.animation.update(time);

            if (this.animation.isOver()) {
                this.position = this.endPosition;
                this.animation = null;
            }

        }
    }

    addAnimation(points) {

        let first =  [points.first[0] * 0.4, 0, points.first[1] * 0.4]
        let end = [points.end[0] * 0.4, 0, points.end[1] * 0.4];

        let offset = end.map(function(item, idx){
            return item - first[idx];
        })

        let controlPoints = [
            [0, 0, 0],
            offset
        ];

        this.animation = new LinearAnimation(this.scene, controlPoints, 1);
        this.endPosition = points.end;
    }

    updateTexCoords(dummy1, dummy2) {

    }
};