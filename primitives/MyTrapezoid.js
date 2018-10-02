/**
 * MyTrapezoid
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

class MyTrapezoid extends CGFobject
{

    constructor(scene, p1, p2, p3, p4, nrDivs){
		super(scene);
      // nrDivs = 1 if not provided
		nrDivs = typeof nrDivs !== 'undefined' ? nrDivs : 1;

		this.nrDivs = nrDivs;
		this.patchLength = 1.0 / nrDivs;	


        //left side, top to bottom
        this.p1 = p1; 
        this.p2 = p2;
        this.leftSlope = (p2.y - p1.y) / (p2.x - p1.x); 

        //right side, top to bottow
        this.p3 = p3; 
        this.p4 = p4;
        this.rightSlope = (p4.y - p3.y) / (p4.x - p3.x);

        this.scene = scene;

        this.initBuffers();
    }
    
    initBuffers(){

        this.vertices = [];

        this.vertices.push(
            this.p1.x, this.p1.y, 0,
           this.p2.x, this.p2.y, 0,
            this.p3.x, this.p3.y, 0,
            this.p4.x, this.p4.y, 0
        );

        this.indices = []; 

        this.texCoords = [];

        this.indices.push(
            0, 1, 2,
            3, 2, 1

        );

        this.normals = [
				0, 0, 1,
				0, 0, 1,
				0, 0, 1,
				0, 0, 1
        ];
        
        this.texCoords.push(
            0, 0,
            0, 1, 
            1, 0, 
            1, 1
        );


        this.primitiveType=this.scene.gl.TRIANGLES;
		this.initGLBuffers();
    }

}