class BlackPiece extends Piece {
    /**
     * @param  {XML Scene} scene
     */
    constructor(scene, position) {
        super(scene, position);
        this.mat.setTexture(this.scene.graph.textures['black_piece']);

    };

};