const pitShell = [
	[-1.5, 0, 6.5],
	[-1.5, 0, 3.5],
	[0, 3.0, 6.5],
	[0, 3.0, 3.5],
	[1.5, 0, 6.5],
	[1.5, 0, 3.5]
];

const thrusters = [
	[-1.5, 0.0, 0],
	[-0.1, 0, -5.5],
	[0, 1.5, 0],
	[0, 0, 0],
	[1.5, 0.0, 0],
	[0.1, 0.0, -5.5]
];


const pitWindow = [
	[-0.2, 0, 10.5],
	[-1.5, 0, 6.5],
	[0, 0, 10.5],
	[0, 3.0, 6.5],
	[0.2, 0, 10.5],
	[1.5, 0, 6.5]
];


const body = [
	[-1.5, 0, 3.5],
	[-1.5, 0, 3],
	[-1.5, 0, 2.5],
	[-1.5, 0, 2],
	[-1.5, 0, 1.5],
	[-1.5, 0, 1],
	[-1.5, 0, 0.5],
	[-1.5, 0, 0],

	[0, 3, 3.5],
	[0, 2.95, 3],
	[0, 2.9, 2.5],
	[0, 2.6, 2],
	[0, 2.2, 1.5],
	[0, 1.8, 1],
	[0, 1.6, 0.5],
	[0, 1.5, 0],

	[1.5, 0, 3.5],
	[1.5, 0, 3],
	[1.5, 0, 2.5],
	[1.5, 0, 2],
	[1.5, 0, 1.5],
	[1.5, 0, 1],
	[1.5, 0, 0.5],
	[1.5, 0, 0]
];


/* const pitShell = [
		[-1.5, -1.5, 0.0],
		[-1.5, 1.5, 0.0],
		[0, -1.5, 3.0],
		[0, 1.5, 3.0],
		[1.5, -1.5, 0.0],
		[1.5, 1.5, 0.0]
];
 */


/* const pitWindow = [
	[-1.5, 1.5, 0.0],
	[-0.1, 5.5, 0.0],
	[0, 1.5, 3.0],
	[0, 5.5, 0],
	[1.5, 1.5, 0.0],
	[0.1, 5.5, 0.0]
]; */

const pitBack = [
	[-0.5, -7, 0.0],
	[-1.5, -1.5, 0.0],
	[0, -7, 0],
	[0, -1.5, 3.0],
	[0.5, -7, 0.0],
	[1.5, -1.5, 0.0]
];

const base = [
	[-3, -10, 0.0],
	[-2.5, 1, 0.0],
	[3, -10, 0.0],
	[2.5, 1, 0.0]
];


const bottom_body = [

	[-0.2, 0, 10.5],
	[-1.65, 0, 6.5],
	[-1.8, 0, 6.5],
	[-1.8, 0, 3.5],
	[-1.8, 0, 0],
	[-1.5, 0, 0],
	[-0.1, 0, -5.5],



	[0, 0, 10.5],
	[0, 3.0, 3.5],
	[0, 3.0, 3.5],
	[0, 3, 3.5],
	[0, 3, 0],
	[0, 3, 0],
	[0, 0, -5.5],


	[0.2, 0, 10.5],
	[1.65, 0, 6.5],
	[1.8, 0, 6.5],
	[1.8, 0, 3.5],
	[1.8, 0, 0],
	[1.5, 0, 0],
	[0.1, 0.0, -5.5]
];

const bottom_cover = [

	[-1.5, 0.0, 0],
	[-0.1, 0, -5.5],
	[0, 0, 0],
	[0, 0, -5.5],
	[1.5, 0.0, 0],
	[0.1, 0.0, -5.5]

];

/* const wingLeft = [
	[1, 0.3, 6],
	[1, 0.3, 0],
	[1.3, 0.2, 6],
	[1.3, 0.2, 0],
	[1.3, 0.1, 6],
	[1.3, 0.1, 0],
	[7, 0, 1],
	[7, 0, -1],
];
 */

const wingRight = [
	[-7, 0, 1],
	[-7, 0, -1],
	[-1.5, 0, 6],
	[-1.5, 0, 0]

];



const wingLeft = [
	[1.5, 0, 6],
	[1.5, 0, 0],
	[7, 0, 1],
	[7, 0, -1]
];


const upWing = [
	[0, 0, 0],
	[0, 0, -3],
	[0, 2, -2],
	[0, 2, -3]
];

class Vehicle extends CGFobject {
	constructor(scene) {
		super(scene);
		this.scene = scene;

		this.cockPit = new Patch(this.scene, 3, 2, 20, 10, pitShell);
		this.cockPitWindown = new Patch(this.scene, 3, 2, 20, 10, pitWindow);
		this.cockPitBack = new Patch(this.scene, 3, 2, 20, 10, pitBack);
		this.base = new Patch(this.scene, 2, 2, 20, 10, base);
		this.wingLeft = new Patch(this.scene, 2, 2, 20, 10, wingLeft);
		this.wingRight = new Patch(this.scene, 2, 2, 20, 10, wingRight);
		this.upWing = new Patch(this.scene, 2, 2, 20, 10, upWing);
		this.body = new Patch(this.scene, 3, 8, 20, 10, body);
		this.thrusters = new Patch(this.scene, 3, 2, 20, 10, thrusters);
		this.bot = new Patch(this.scene, 3, 7, 20, 10, bottom_body);
		this.bottom_cover = new Patch(this.scene, 3, 2, 20, 10, bottom_cover);
		this.arms = new MyCylinder(this.scene, 0.3, 0.3, 4, 20, 20);

		this.createMaterials();
	};

	createMaterials() {

		console.log(this.scene.graph.textures);

		this.scene.graph.materials['silver'].setTexture(this.scene.graph.textures['fuselage']);

		this.scene.graph.materials['beige'].setTexture(this.scene.graph.textures['guns_tubes']);

		this.scene.graph.materials['glass'].setTexture(this.scene.graph.textures['fuselage_window']);
	}


	display() {
		this.scene.pushMatrix();

		this.scene.scale(0.1, 0.1, 0.1);

		this.scene.graph.materials['glass'].apply();
		this.cockPitWindown.display();

		this.scene.graph.materials['silver'].apply();

		this.scene.gl.disable(this.scene.gl.CULL_FACE);

		this.scene.scale(0.1, 0.1, 0.1);
		this.body.display();
		this.wingLeft.display();
		this.wingRight.display();
		this.upWing.display();
		this.thrusters.display();
		this.cockPit.display();
		this.bottom_cover.display();

		

		this.scene.graph.materials['silver'].apply();

		this.scene.rotate(Math.PI, 0, 0, 1);
		this.bot.display();

		this.scene.graph.materials['beige'].apply();


		this.scene.translate(4, 0.3, 1);
		this.arms.display();

		this.scene.translate(-8, 0, 0);
		this.arms.display();

		this.scene.gl.enable(this.scene.gl.CULL_FACE);

		this.scene.popMatrix();
	}
};