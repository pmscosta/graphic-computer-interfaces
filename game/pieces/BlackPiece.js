class BlackPiece extends Piece {
    /**
     * @param  {XML Scene} scene
     */
    constructor(scene, position, points) {
        super(scene, position, points);
        this.mat.setTexture(this.scene.graph.textures['black_piece']);

    };

};