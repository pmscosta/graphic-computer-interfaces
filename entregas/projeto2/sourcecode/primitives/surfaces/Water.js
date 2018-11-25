class Water extends CGFobject {
	/**
	 * @param  {XML Scene} scene
	 * @param  {Colored texture id} idtexture
	 * @param  {HeightMap texture id} idheightmap
	 * @param  {Number of divisons (in both dimension)} parts
	 * @param  {Height scale factor} heightscale
	 * @param  {Tex Divisons Scale} texscale
	 */
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
		this.shader.setUniformsValues({normScale:this.heightscale});
		this.shader.setUniformsValues({texScale:this.texscale});

		this.timeInt=0;

		this.guiFact = 1.0; 

	};

	/**
	 * Creates the two needed shaders and loads the textures
	 */
	createShaders(){
		this.shader = new CGFshader(this.scene.gl, "../../shaders/water.vert","../../shaders/water.frag");
		this.texture = this.scene.graph.textures[this.idtexture];

		this.wavemap = this.scene.graph.textures[this.idwavemap];

		this.shader.setUniformsValues( {uSampler2: 1});

	}
	/**
	 * @param  {Time elapsed since the last update} currTime
	 * 
	 */
	update(currTime){


		this.timeInt += currTime / 4000 * this.guiFact; 

	  this.shader.setUniformsValues({factor:this.timeInt});

	}

	updateGuiFactor(value){
		this.guiFact = value; 
	}

	display() {
		this.scene.setActiveShader(this.shader);


		this.wavemap.bind(1);

		this.texture.bind(0);

		this.scene.pushMatrix();

		this.scene.scale(2, 1, 2);

		this.plane.display();

		this.scene.popMatrix();

		this.scene.setActiveShader(this.scene.defaultShader);
	}
};
