class Cylinder2 extends CGFobject {

	constructor(scene, npartsU, npartsV) {
		super(scene);

		this.slices = slices;
		this.stacks = stacks;
		this.base = base;
		this.radius = 1;
		this.top = top; 
		this.heigth = heigth;
        this.ang = (Math.PI * 2) / slices;
        this.npartsU = npartsU;
		this.npartsV = npartsV;

		if(this.base > this.top){
			this.b1 = this.top;
			this.b2 = this.base;
		}else{
			this.b2 = this.base; 
			this.b1 = this.top;
		}

		this.stack_divider = this.heigth / stacks;

		this.spacer = 1.0 / slices;
		this.spacer_y = 1.0 / this.stacks;

		this.initBuffers();
	};
    
}