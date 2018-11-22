class Water extends CGFobject {

	constructor(scene, idtexture, idwavemap,parts,heightscale,texscale) {
		super(scene);
		this.scene = scene;
		this.idtexture = idtexture;
        this.idwavemap = idwavemap;
        this.parts = parts;
        this.heightscale = heightscale;
        this.texscale = texscale;

		this.plane = new Plane(this.scene,this.parts,this.parts);

		this.createShaders();
		this.shader.setUniformsValues({normScale:this.heightscale})

		this.fac = 5.0;
		this.timeInt=0;
		this.up = true;

	};

	createShaders(){
		this.shader = new CGFshader(this.scene.gl, "../../shaders/water.vert","../../shaders/water.frag");
		this.texture = this.scene.graph.textures[this.idtexture];

		this.wavemap = this.scene.graph.textures[this.idwavemap];

		this.shader.setUniformsValues( {uSampler2: 1});

	}

	update(timestamp){
		this.timeInt += 0.00043;


	  this.shader.setUniformsValues({factor:this.timeInt});

	}
	display() {
		this.scene.setActiveShader(this.shader);


		this.wavemap.bind(1);

		this.texture.bind(0);

		this.scene.pushMatrix();

		this.plane.display();

		this.scene.popMatrix();

		this.scene.setActiveShader(this.scene.defaultShader);
	}
};
