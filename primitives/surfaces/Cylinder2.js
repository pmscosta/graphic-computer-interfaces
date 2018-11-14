class Cylinder2 extends CGFobject {

	constructor(scene, base, top, heigth, slices, stacks) {
		super(scene);

		this.slices = slices;
		this.stacks = stacks;
		this.base = base;
		this.radius = 1;
		this.top = top;
		this.heigth = heigth;
		this.ang = (Math.PI * 2) / slices;
		this.npartsU = slices;
		this.npartsV = stacks;

		this.stack_divider = this.heigth / stacks;

		this.spacer = 1.0 / slices;
		this.spacer_y = 1.0 / this.stacks;

		this.weight = Math.sin(Math.PI / 4)
		this.half_radius = this.radius / 2.0;

		this.controlPoints = this.makeControlPoints();

		this.cylinder = this.makeSurface(8, 1, this.controlPoints);


	};

	makeControlPoints() {

		let B5 = [-this.half_radius, 0, this.half_radius, this.weight];
		let B5_z = [-this.half_radius, this.heigth, this.half_radius, this.weight];
		let B6 = [0, 0, this.half_radius, 1];
		let B6_z = [0, this.heigth, this.half_radius, 1];
		
		let B4 = [-this.half_radius, 0, 0, 1];
		let B4_z = [-this.half_radius, this.heigth, 0, 1];
		let B3 = [-this.half_radius, 0, -this.half_radius, this.weight];
		let B3_z = [-this.half_radius, this.heigth, -this.half_radius, this.weight];
		
		let B2 = [0, 0, -this.half_radius, 1];
		let B2_z = [0, this.heigth, -this.half_radius, 1];
		let B1 = [this.half_radius, 0, -this.half_radius, this.weight];
		let B1_z = [this.half_radius, this.heigth, -this.half_radius, this.weight];
		
		let B0 = [this.half_radius, 0, 0, 1];
		let B0_z = [this.half_radius, this.heigth, 0, 1];
		let B8 = B1;
		let B7 = [this.half_radius, 0, this.half_radius, this.weight];
		let B7_z = [this.half_radius, this.heigth, this.half_radius, this.weight];

		return [
			[
				B6, B6_z
			],
			[
				B7, B7_z
			],
			[
				B0, B0_z
			],
			[
				B1, B1_z
			],
			[
				B2, B2_z
			],
			[
				B3, B3_z
			],
			[
				B4, B4_z
			],
			[
				B5, B5_z
			],
			[
				B6, B6_z
			]

		];

	}


	makeSurface(degree1, degree2, controlvertexes) {

		var nurbsSurface = new CGFnurbsSurface(degree1, degree2, controlvertexes);

		var obj = new CGFnurbsObject(this.scene, this.npartsU, this.npartsV, nurbsSurface);

		return obj;

	}

	display() {

		this.scene.pushMatrix();
			this.scene.rotate(Math.PI / 2.0, 1,0, 0);
			this.cylinder.display();
		this.scene.popMatrix();
	}


}