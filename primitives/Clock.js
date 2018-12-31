class Clock{

    constructor(scene, points){

        this.scene = scene;

        this.body = new MyCylinder(this.scene,Math.sqrt(2) / 4,Math.sqrt(2) / 4,1,4,1);
        let value = -Math.sqrt(2) / 4

        this.tensDisplay = new MyRectangle(this.scene, [value, value, -value, -value]);
        this.unitsDisplay = new MyRectangle(this.scene, [value, value, -value, -value]);
        this.cover = new MyRectangle(this.scene, [-1, -1, 1, 1]); 
        
        this.timeElapsed = 0; 

        this.coverMat = new CGFappearance(this.scene);
        this.coverMat.setShininess(100);
        this.coverMat.setEmission(1, 1, 1, 1);
        this.coverMat.setTexture(this.scene.graph.textures['black']);

        this.tensMat =  new CGFappearance(this.scene);
        this.tensMat.setShininess(100);
        this.tensMat.setEmission(1,1,1,1);
        this.tensMat.setTexture(this.scene.graph.textures['digit_0']);

        this.unitsMat =  new CGFappearance(this.scene);
        this.unitsMat.setShininess(100);
        this.unitsMat.setEmission(1, 1,1, 1);
        this.unitsMat.setTexture(this.scene.graph.textures['digit_0']);

        this.lastTen = 0;
        this.lastUnit = 0; 
        this.points = [];
        this.points[0] = points[0] + 4;
        this.points[1] = points[1] + Math.sqrt(2) / 8;
        this.points[2] = points[2] + 2.15;

        this.game = null;
        
        this.pause = false;

    }

    update(time){

        if(this.pause)
            return;

        if(this.timeElapsed > 200){
            this.game.timeUp();
            this.reset();
        }

        this.timeElapsed += (time / 1000);

        this.tens = Math.floor(this.timeElapsed / 10) % 10;

        this.units = Math.floor(this.timeElapsed % 10);
    }

    updateTexName(){

        
        if(this.lastTen != this.tens){
            this.tensName = 'digit_' + this.tens;
             this.tensMat.setTexture(this.scene.graph.textures[this.tensName]);
             this.lastTen = this.tens;
        }

        if(this.lastUnit != this.units){
            this.unitsName = 'digit_' + this.units;
        this.unitsMat.setTexture(this.scene.graph.textures[this.unitsName]);
            this.lastUnit = this.units;

        }


    }

    reset(){
        this.timeElapsed = 0;
        this.pause = false;
    }

    assignGame(game){
        this.game = game; 
        this.game.clock = this;
    }


    display(){

        this.updateTexName();

        this.scene.pushMatrix();
            this.scene.translate( this.points[0], this.points[1], this.points[2]);
            this.scene.rotate(Math.PI / 4, 0, 0, 1);
            this.scene.scale(0.7, 0.7, 0.7);
            this.body.display();
        this.scene.popMatrix();


        this.scene.pushMatrix();
            this.scene.translate(this.points[0] - 0.18, this.points[1], this.points[2] + 0.5);
            this.scene.rotate(-Math.PI / 2, 1, 0, 0);
            this.scene.rotate(-Math.PI /2, 0, 0, 1);
            this.scene.rotate(Math.PI / 2, 1, 0, 0);
            this.scene.scale(0.4, 0.4, 0.4); 

            this.unitsMat.apply();
            
            this.tensDisplay.display();

            this.tensMat.apply();   
            this.scene.translate(-0.8, 0, 0);
            this.unitsDisplay.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();

            this.scene.translate(this.points[0] -0.179, this.points[1], this.points[2] + 0.35);
            this.scene.rotate(-Math.PI / 2, 1, 0, 0);
            this.scene.rotate(-Math.PI /2, 0, 0, 1);
            this.scene.rotate(Math.PI / 2, 1, 0, 0);
            this.scene.scale(0.4, 0.4, 0.4); 


        this.scene.scale(0.8, 0.37, 1);

        this.coverMat.apply();
        this.cover.display();

        this.scene.popMatrix();
    }

   updateTexCoords(){

    }
}