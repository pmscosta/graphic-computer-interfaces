class Terrain extends CGFobject {
	/**
	 * @param  {XMl Scene} scene
	 * @param  {Colored texture id} idtexture
	 * @param  {HeightMap texture id} idheightmap
	 * @param  {Number of divisons (in both dimension)} parts
	 * @param  {Height scale factor} heightscale
	 */
	constructor(scene, idtexture, idheightmap, mask, parts,heightscale) {
		super(scene);
		this.scene = scene;
		this.idtexture = idtexture;
        this.idheightmap = idheightmap;
        this.heightscale = heightscale;
		this.parts = parts;
		this.idMask = mask;

		//console.log(idheightmap, idtexture, mask);

		console.log(this.mask);
		

		this.plane = new Plane(this.scene, this.parts, this.parts);

		this.createShaders();

		console.log(this);
	};
	
	/**
	 * Creates the two needed shaders and loads the textures
	 */
	createShaders() {
		this.shader = new CGFshader(this.scene.gl, "../../shaders/terrain.vert","../../shaders/terrain.frag");
		this.texture = this.scene.graph.textures[this.idtexture];
		this.heightMap = this.scene.graph.textures[this.idheightmap];
		this.mask = this.scene.graph.textures[this.idMask];

		this.shader.setUniformsValues( {uSampler1: 1});
		this.shader.setUniformsValues( {uSampler2: 2});

		this.shader.setUniformsValues( {hScale: this.heightscale});

	}

	display() {

		this.scene.setActiveShader(this.shader);

		this.texture.bind(0);
		this.heightMap.bind(1);
		this.mask.bind(2);

		this.scene.pushMatrix();

		this.plane.display();

		this.scene.popMatrix();

		this.scene.setActiveShader(this.scene.defaultShader);
	}

};
