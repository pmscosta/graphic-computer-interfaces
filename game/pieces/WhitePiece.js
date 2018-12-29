class WhitePiece extends Piece {
    /**
     * @param  {XML Scene} scene
     */
    constructor(scene, position, points) {
        super(scene, position, points);
        this.mat = this.scene.graph.materials['full_white'];
        this.mat.setTexture(this.scene.graph.textures['white_piece']);

    };

};