class Plane extends CGFobject {

	constructor(scene, npartsU, npartsV) {
		super(scene);
		this.scene = scene;
		this.npartsU = npartsU;
		this.npartsV = npartsV;

		this.plane = this.makeSurface(1, 1,
			[
				[
					[-0.5, 0, 0, 5, 1],
					[-0.5, 0, -0, 5, 1]
				],
				[
					[0.5, 0, 0.5, 1],
					[0.5, 0, -0.5, 1]
				]
			]);

	};

	makeSurface(degree1, degree2, controlvertexes) {

		var nurbsSurface = new CGFnurbsSurface(degree1, degree2, controlvertexes);

		var obj = new CGFnurbsObject(this.scene, this.npartsU, this.npartsV, nurbsSurface);
		
		return obj;

	}

	display() {
		this.plane.display();
	}

};