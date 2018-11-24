class Plane extends CGFobject {
	/**
	 * @param  {XML Scene} scene
	 * @param  {Number of divisions in U} npartsU
	 * @param  {Number of divisions in V} npartsV
	 */
	constructor(scene, npartsU, npartsV) {
		super(scene);
		this.scene = scene;
		this.npartsU = npartsU;
		this.npartsV = npartsV;

		this.plane = this.makeSurface(1, 1,
			[
				[	
					[-0.5, 0, 0.5, 1],
					[-0.5, 0, -0.5, 1]
				],
				[
					[0.5, 0, 0.5, 1],
					[0.5, 0, -0.5, 1]
				]
			]);

	};

	/**
	 * @param  {U Degree} degree1
	 * @param  {V Degree} degree2
	 * @param  {Number of control points} controlvertexes
	 */
	makeSurface(degree1, degree2, controlvertexes) {

		var nurbsSurface = new CGFnurbsSurface(degree1, degree2, controlvertexes);

		var obj = new CGFnurbsObject(this.scene, this.npartsU, this.npartsV, nurbsSurface);

		return obj;

	}

	display() {
		this.plane.display();
	}

};