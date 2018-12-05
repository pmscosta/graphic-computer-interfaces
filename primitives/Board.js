class Board extends CGFobject {
    /**
     * @param  {XML Scene} scene
     */
    constructor(scene) {
        super(scene);
        this.scene = scene;
        this.plane = new Plane(this.scene, 20, 20);
        this.marker = new MyRectangle(this.scene, [0, 0.3, 0.3, 0], 0, 1, 0, 1);

        this.mat =  this.scene.graph.materials['m1'];
        this.mat.setTexture(this.scene.graph.textures['def_text']);


    };

    display() {
        this.scene.pushMatrix();
            this.scene.scale(2, 1, 2);
            this.scene.translate(0.5, 0 , 0.5);
            this.plane.display();
        this.scene.popMatrix();

        if (this.scene.pickMode) 
            this.placePickingSquare();
    }

    placePickingSquare(){

        for(let i = 0; i < 5; i++){
            for(let j = 0; j < 5; j++){
                this.scene.pushMatrix();
                    this.mat.apply();
                    this.scene.translate(0.4 * i, 0.01, 0.4 * j);
                    this.scene.translate(0.05, 0, 0.05);

                    this.scene.registerForPick((i+1)*10 + (j+1), this.marker);

                    this.marker.display();  
                this.scene.popMatrix();
            }
        }
    }

    updateTexCoords(dummy1, dummy2) {

    }
};