class Cylinder2 extends CGFobject {

	constructor(scene, base,top,heigth,slices, stacks) 
	{
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

		this.cylinder = this.makeSurface(1, 1,
			[
				[
					[1, 0, 0, this.weight],
					[1, 0, this.heigth, this.weight]
				],
				[
					[1, 2, 0, this.weight],
					[1, 2, this.heigth, this.weight]
                ],
                [
                    [-1, 2, 0, this.weight],
					[1, 2, this.heigth, this.weight]
                ],
                [
                    [1, 2, 0, this.weight],
					[1, 2, this.heigth, this.weight]
                ],
                [
                    [1, 2, 0, this.weight],
					[1, 2, this.heigth, this.weight]
                ],
                [
                    [1, 2, 0, this.weight],
					[1, 2, this.heigth, this.weight]
                ],
			]);
    };
    

    makeSurface(degree1, degree2, controlvertexes) {

		var nurbsSurface = new CGFnurbsSurface(degree1, degree2, controlvertexes);

		var obj = new CGFnurbsObject(this.scene, this.npartsU, this.npartsV, nurbsSurface);
		
		return obj;

	}

    
}