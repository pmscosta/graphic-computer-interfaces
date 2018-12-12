class Board extends CGFobject {
    /**
     * @param  {XML Scene} scene
     */
    constructor(scene) {
        super(scene);
        this.scene = scene;
        this.plane = new Plane(this.scene, 20, 20);
        this.marker = new MyRectangle(this.scene, [0, 0.3, 0.3, 0], 0, 1, 0, 1);

        this.mat =  this.scene.graph.materials['table_wood'];

        this.whitePieces = [new WhitePiece(this.scene, [2,3]), new WhitePiece(this.scene, [0, 0]), new WhitePiece(this.scene, [4,0])];
        this.blackPieces = [new BlackPiece(this.scene, [2,1]), new BlackPiece(this.scene, [1, 4]), new BlackPiece(this.scene, [3,4])];

        this.b = this.getBoard();
    };

    getPiece(list,pos){
        let res = null;
        list.forEach(function(p){
            if(p.position[0]==pos[0] && p.position[1]==pos[1])res=p;});
        return res;
    }

    getDif(oldB,newB){
        let state=[]
        newB = JSON.parse(newB)

        for(let i = 0; i < oldB.length;i++){
            for(let j = 0; j < oldB.length;j++){
                if(oldB[i][j] != newB[i][j]){
                    let piece = this.getPiece(this.whitePieces,[i,j]);
                    console.log("Hre",piece);
                    if(piece == null)
                        state['newCell'] = [i,j]; 
                    else
                        state['piece'] = piece;
                }
            }
        }
        return state;
    }

    updateBoard(newBoard){
        let state = this.getDif(this.b,newBoard);
        this.b=newBoard;
        state['piece'].position = state['newCell'];

    }

    getBoard(){
        let b = [[0,0,0,0,0],
        [0,0,0,0,0],
        [0,0,0,0,0],
        [0,0,0,0,0],
        [0,0,0,0,0]];

        this.whitePieces.forEach(p=>b[p.position[1]][p.position[0]] = 2);
        this.blackPieces.forEach(p=>b[p.position[1]][p.position[0]] = 1);

        return b;
    }

    display() {
        this.scene.pushMatrix();
            this.scene.scale(2, 1, 2);
            this.scene.translate(0.5, 0 , 0.5);
            this.plane.display();
        this.scene.popMatrix();

        this.displayPieces();
    }
/* 
    placePickingSquare(){

        for(let i = 0; i < 5; i++){
            for(let j = 0; j < 5; j++){
                this.scene.pushMatrix();
                    
                    this.scene.translate(0.4 * i, 0.01, 0.4 * j);
                    this.scene.translate(0.05, 0, 0.05);

                    this.scene.registerForPick((i+1)*10 + (j+1), this.marker);

                    this.marker.display();  
                this.scene.popMatrix();
            }
        }
    } */
    
    displayPieces(){
        this.whitePieces.forEach(element => {
            element.display();
        });

        this.blackPieces.forEach(element => {
            element.display();
        });
    }

    updateTexCoords(dummy1, dummy2) {

    }
};