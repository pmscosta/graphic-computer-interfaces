class BlackPiece extends CGFobject {
    /**
     * @param  {XML Scene} scene
     */
    constructor(scene, position) {
        super(scene);
        this.scene = scene;
        this.position = position || [0, 0];

        this.piece = new MyCylinder(this.scene,0.12,0.12,0.1,20,20); 

        this.mat =  this.scene.graph.materials['m1'];
        this.mat.setTexture(this.scene.graph.textures['black_piece']);
    };

    display() {
        this.scene.pushMatrix();
            this.mat.apply();
            this.scene.registerForPick((this.position[0]+1)*10 + (this.position[1]+1), this.piece);
            this.scene.translate(0.4 * this.position[0], 0 , 0.4 * this.position[1]);
            this.scene.translate(0.2, 0, 0.2);
            this.scene.rotate(-Math.PI/2, 1, 0, 0);
            this.piece.display();
        this.scene.popMatrix();
    }

    updateTexCoords(dummy1, dummy2) {

    }
};