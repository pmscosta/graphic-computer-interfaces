class Cylinder2 extends CGFobject {

	constructor(scene, base, top, heigth, slices, stacks) {
		super(scene);

		this.base = base;
		this.top = top;
		this.heigth = heigth;
		this.npartsU = slices;
		this.npartsV = stacks;

		this.weight = 1;

		this.controlPoints = this.makeTopControlPoints();

		this.cylinderUp = this.makeSurface(3, 1, this.controlPoints);

		this.controlPoints = this.makeBotControlPoints();

		this.cylinderBot = this.makeSurface(3, 1, this.controlPoints);
	};

	makeTopControlPoints() {

		let P1 = [this.base, 0, 0, 1];
		let P1_z = [this.top, 0, this.heigth, 1];

		let P2 = [this.base, 4/3 * this.base, 0, 1];
		let P2_z = [this.top, 4/3 * this.top, this.heigth, 1];

		let P3 = [-this.base, 4/3 * this.base, 0, 1];
		let P3_z = [-this.top, 4/3 * this.top, this.heigth, 1];

		let P4 = [-this.base, 0, 0, 1];
		let P4_z = [-this.top, 0, this.heigth, 1];
		

		return [
			[
				P1, P1_z
			],
			[
				P2, P2_z
			],
			[
				P3, P3_z
			],
			[
				P4, P4_z
			]
		];

	}

	makeBotControlPoints() {

		let P1 = [-this.base, 0, 0, 1];
		let P1_z = [-this.top, 0, this.heigth, 1];

		let P2 = [-this.base, -4/3 * this.base, 0, 1];
		let P2_z = -[this.top, -4/3 * this.top, this.heigth, 1];

		let P3 = [this.base, -4/3 * this.base, 0, 1];
		let P3_z = [this.top, -4/3 * this.top, this.heigth, 1];

		let P4 = [this.base, 0, 0, 1];
		let P4_z = [this.top, 0, this.heigth, 1];
		

		return [
			[
				P1, P1_z
			],
			[
				P2, P2_z
			],
			[
				P3, P3_z
			],
			[
				P4, P4_z
			]
		];

	}


	makeSurface(degree1, degree2, controlvertexes) {

		var nurbsSurface = new CGFnurbsSurface(degree1, degree2, controlvertexes);

		var obj = new CGFnurbsObject(this.scene, this.npartsU, this.npartsV, nurbsSurface);

		return obj;

	}

	display() {

		this.cylinderUp.display(); 
		this.cylinderBot.display();
	}


}