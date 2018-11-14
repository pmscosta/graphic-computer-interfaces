class Terrain extends CGFobject {

	constructor(scene, idtexture, idheightmap,parts,heightscale) {
		super(scene);
		this.scene = scene;
		this.idtexture = idtexture;
        this.idheightmap = idheightmap;
        this.heightscale = heightscale;
        this.parts = parts;

	};

	display() {
	}

};