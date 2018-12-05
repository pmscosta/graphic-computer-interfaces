class Patch extends CGFobject {
	/**
	 * @param  {XML Scene} scene
	 * @param  {Number of U points} npointsU
	 * @param  {Number of V points} npointsV
	 * @param  {Number of divisions in U} npartsU
	 * @param  {Number of divisions in V} npartsV
	 * @param  {Single Array with all the control points} controlPoint
	 */
	constructor(scene, npointsU, npointsV, npartsU, npartsV, controlPoint) {
		super(scene);
		this.scene = scene;
		this.npartsU = npartsU;
		this.npartsV = npartsV;
		this.npointsU = npointsU;
		this.npointsV = npointsV;
		this.controlPoint = controlPoint;


		this.vertexes = this.cleanUpControlPoint();

            

		this.patch = this.makeSurface(this.npointsU - 1, this.npointsV - 1, this.vertexes);
	
	};

	/**
	 * Formats the input controlpoints array to match the input of the nurbs surface
	 */
	cleanUpControlPoint() {

		let vertexes = [];


		for (let u = 0; u < this.npointsU; u++) {

			let innerV = [];

			for (let v = 0; v < this.npointsV; v++) {
				let point = this.controlPoint[this.npointsV * u + v].concat(1);
				innerV.push(point);
			}

			vertexes.push(innerV);


		}


		return vertexes;

	}

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

		this.patch.display();
	}

	updateTexCoords(length_s, lenght_t) {

		this.updateTexCoordsGLBuffers();
	  }

};
