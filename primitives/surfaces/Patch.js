class Patch extends CGFobject {

	constructor(scene, npointsU, npointsV,npartsU,npartsV,controlPoint) {
		super(scene);
		this.scene = scene;
		this.npartsU = npartsU;
        this.npartsV = npartsV;
        this.npointsU = npointsU;
        this.npointsV = npointsV;
        this.controlPoint=controlPoint;

	};

	display() {
	}

};