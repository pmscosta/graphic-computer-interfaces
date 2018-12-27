class WhitePiece extends CGFobject {
    /**
     * @param  {XML Scene} scene
     */
    constructor(scene, position) {
        super(scene);
        this.scene = scene;
        this.position = position || [0, 0];

        this.piece = new MyCylinder(this.scene, 0.12, 0.12, 0.1, 20, 20);

        this.mat = this.scene.graph.materials['full_white'];
        this.mat.setTexture(this.scene.graph.textures['white_piece']);
        this.animation = null;
        this.endPosition = null;
    };

    display() {
        this.scene.pushMatrix();
        this.mat.apply();
        this.scene.registerForPick((this.position[0] + 1) * 10 + (this.position[1] + 1), this.piece);
        this.scene.translate(0.4 * this.position[0], 0, 0.4 * this.position[1]);
        this.scene.translate(0.2, 0, 0.2);
        if (this.animation != null)
        this.animation.apply();
        this.scene.rotate(-Math.PI / 2, 1, 0, 0);
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