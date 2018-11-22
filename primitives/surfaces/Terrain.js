class Terrain extends CGFobject {

	constructor(scene, idtexture, idheightmap,parts,heightscale) {
		super(scene);
		this.scene = scene;
		this.idtexture = idtexture;
        this.idheightmap = idheightmap;
        this.heightscale = heightscale;
		this.parts = parts;

		this.plane = new Plane(this.scene, this.parts, this.parts);

		this.createShaders();

		console.log(this);
	};

	createShaders(){
		this.shader = new CGFshader(this.scene.gl, "../../shaders/terrain.vert","../../shaders/terrain.frag");
		this.texture = this.scene.graph.textures[this.idtexture];
		this.heightMap = this.scene.graph.textures[this.idheightmap];

		this.shader.setUniformsValues( {uSampler2: 1});

	}

	display() {

		this.scene.setActiveShader(this.shader);

		this.heightMap.bind(1);

		this.texture.bind(0);

		this.scene.pushMatrix();

		this.scene.translate(5, 0, 5);

		this.scene.scale(20, 1, 20);

		this.plane.display();

		this.scene.popMatrix();

		this.scene.setActiveShader(this.scene.defaultShader);
	}

};
