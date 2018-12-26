class Clock{

    constructor(scene){

        this.scene = scene;

        this.body = new MyCylinder(this.scene,Math.sqrt(2) / 4,Math.sqrt(2) / 4,1,4,1);

        this.tensDisplay = new MyRectangle(this.scene, [-Math.sqrt(2) / 4, -Math.sqrt(2) / 4, Math.sqrt(2) / 4, Math.sqrt(2) / 4]); 
        this.unitsDisplay = new MyRectangle(this.scene, [-Math.sqrt(2) / 4, -Math.sqrt(2) / 4, Math.sqrt(2) / 4, Math.sqrt(2) / 4]); 
        
        this.timeElapsed = 0; 

        this.tensMat =  new CGFappearance(this.scene);
        this.tensMat.setTexture(this.scene.graph.textures['digit_0']);

        this.unitsMat =  new CGFappearance(this.scene);
        this.unitsMat.setTexture(this.scene.graph.textures['digit_0']);

        this.lastTen = 0;
        this.lastUnit = 0; 
        
    }

    update(time){
        this.timeElapsed += (time / 1000);

        this.tens = Math.floor(this.timeElapsed / 10); 

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


    display(){

        this.updateTexName();

        this.scene.pushMatrix();
            this.scene.translate(2.8, Math.sqrt(2) / 8, 0.68);
            this.scene.rotate(Math.PI / 4, 0, 0, 1);
            this.scene.scale(0.7, 0.7, 0.7);
            this.body.display();
        this.scene.popMatrix();


        this.scene.pushMatrix();
            this.scene.translate(2.8 - Math.sqrt(2) / 8, 0.17, 1.2);
            this.scene.rotate(-Math.PI / 2, 1, 0, 0);
            this.scene.rotate(-Math.PI /2, 0, 0, 1);
            this.scene.scale(0.4, 0.6, 0.4); 

            this.unitsMat.apply();
            
            this.tensDisplay.display();

            this.tensMat.apply();   
            this.scene.translate(-0.8, 0, 0);
            this.unitsDisplay.display();
        this.scene.popMatrix();
    }

   updateTexCoords(){

    }
}