/**
 * MyCylinder
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

class Diamond extends CGFobject {
    constructor(scene, slices) {

        super(scene);

        this.slices = slices;

        this.ang = (Math.PI * 2) / slices;

        console.log(this.ang);

        this.spacer = 1.0 / slices;

        this.heigth = 1;

        this.initBuffers();
    };

    initBuffers() {
        this.vertices = [];

        this.indices = [];

        this.normals = [];

        this.texCoords = [];

        let u_coord = 0;

        let v_coord = 0;

        this.vertices.push(0, this.heigth, 0);
        
        for (let i = 0; i <= this.slices; i++) {

            var angle1 = this.ang * i;
            var x1 = 0.5*Math.cos(angle1);
            var y1 = 0.5*Math.sin(angle1);

            this.vertices.push(x1, 0, y1);
            this.texCoords.push(1 - u_coord, 1 - v_coord);
            this.normals.push(x1, y1, 0);

            u_coord += this.spacer;
        }


        for(let i = 0; i < this.slices-1; i++){
            this.indices.push(0, i +1, i+2);
        }

        this.indices.push(0, this.slices , 1);

        this.originalTex = this.texCoords.slice();

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    };

    display(){
        super.display();
        this.scene.rotate(-Math.PI , 0, 0, 1); 
        super.display();
    }


    updateTexCoords(length_s, lenght_t) {
        for (let i = 0; i < this.originalTex.length; i += 2) {
            this.texCoords[i] = this.originalTex[i] / length_s;
            this.texCoords[i + 1] = this.originalTex[i + 1] / lenght_t;
        }

        this.baseCover.updateTexCoords(length_s, lenght_t);
        this.topCover.updateTexCoords(length_s, lenght_t);

        this.updateTexCoordsGLBuffers();
    }
};