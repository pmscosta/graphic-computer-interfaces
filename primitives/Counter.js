class Counter {

    constructor(scene, points) {

        this.scene = scene;

        this.body = new MyCylinder(this.scene, Math.sqrt(2) / 4, Math.sqrt(2) / 4, 2, 4, 1);

        let value = -Math.sqrt(2) / 4

        this.player1Display = new MyRectangle(this.scene, [value, value, -value, -value]);
        this.player2Display = new MyRectangle(this.scene, [value, value, -value, -value]);
        this.cover = new MyRectangle(this.scene, [-1, -1, 1, 1]);

        this.score = [0, 0];

        this.coverMat = new CGFappearance(this.scene);
        this.coverMat.setShininess(100);
        this.coverMat.setEmission(1, 1, 1, 1);
        this.coverMat.setTexture(this.scene.graph.textures['black']);

        this.player1Mat = new CGFappearance(this.scene);
        this.player1Mat.setShininess(100);
        this.player1Mat.setEmission(1, 1, 1, 1);
        this.player1Mat.setTexture(this.scene.graph.textures['digit_0']);

        this.player2Mat = new CGFappearance(this.scene);
        this.player2Mat.setShininess(100);
        this.player2Mat.setEmission(1, 1, 1, 1);
        this.player2Mat.setTexture(this.scene.graph.textures['digit_0']);

        this.mats = [this.player1Mat, this.player2Mat];

        this.points = [];
        this.points[0] = points[0] + 1.05;
        this.points[1] = points[1] + Math.sqrt(2) / 8;
        this.points[2] = points[2] + 1.75;
        this.game = null;

    }

    updateScore(player) {

        player--;

        ++this.score[player];

        this.updateTex(player);


    }

    updateTex(player) {

        let name = 'digit_' + this.score[player];

        this.mats[player].setTexture(this.scene.graph.textures[name]);
    }

    reset() {
        this.score = [0, 0];
    }

    assignGame(game) {
        this.game = game;
        this.game.counter = this;
    }


    display() {

        this.scene.pushMatrix();
            this.scene.translate(this.points[0], this.points[1], this.points[2]);
            this.scene.rotate(-Math.PI / 4, 0, 0, 1);
            this.scene.scale(0.7, 0.7, 0.7);
            this.body.display();
        this.scene.popMatrix();


        this.scene.pushMatrix();

        this.scene.translate(this.points[0] + 0.18, this.points[1], this.points[2] + 0.3);
        this.scene.rotate(Math.PI / 2, 0, 1, 0);
        this.scene.scale(0.4, 0.4, 0.4);


        this.mats[0].apply();
        this.player1Display.display();

        this.mats[1].apply();
        this.scene.translate(-2, 0, 0);
        this.player2Display.display();



        this.scene.popMatrix();

        this.scene.pushMatrix();

        this.scene.translate(this.points[0] + 0.179, this.points[1] , this.points[2] + 0.7);
        this.scene.rotate(Math.PI / 2, 0, 1, 0);
        this.scene.scale(0.4, 0.4, 0.4); 


        this.scene.scale(1.65, 0.37, 1);

        this.coverMat.apply();
        this.cover.display();

        this.scene.popMatrix();

    }

    updateTexCoords() {

    }
}