class Game{
    constructor(scene,board){
        this.scene = scene;
        this.board=board;
        this.server = new Server();
        this.pieceToMove = null;
        this.destination = null;
        this.currentPlayer = 2;
        this.auxLength = this.board.b.length;
        this.clock = null;
        
    }

    init(){
        this.camera = new RotateCamera(this.scene.getGameCamera(),{ from: [1, 1.5, -2], to: [1, 0, 4]}, [0, 1, 0]);
    }


    update(time){

        this.camera.orbitCamera(time);
        this.board.update(time);

    }

    getChoice(source,dest){
        let x = dest[0]-source[0], y=dest[1]-source[1];
        if(x!=0)
            x= x/Math.abs(x)
        if(y!=0)
            y=y/Math.abs(y);


        let dif = [x,y];
        let moveMap= new Object();
        moveMap[[-1,1]] = 9;
        moveMap[[1,0]] = 2;
        moveMap[[-1,0]] = 8;
        moveMap[[0,1]] = 6;
        moveMap[[0,-1]] = 4;
        moveMap[[1,-1]] = 1;
        moveMap[[-1,-1]] = 7;
        moveMap[[1,1]] = 3;
        moveMap[[0,0]] = 0;
        return moveMap[dif];
        
    }


    resetChoices(){
        this.destination =null;
        this.pieceToMove = null;
    }

    assignChoice(row,col){
        let piece = this.board.getBoardPiece(row,col)
        if(this.pieceToMove ==null && piece != 0){
            this.pieceToMove=[row,col];
            this.piece = piece;
        }else if(this.pieceToMove!=null && piece ==0){
            this.destination=[row,col];
            let direction = this.getChoice(this.pieceToMove,this.destination);
            this.move([this.pieceToMove[0]-1,this.pieceToMove[1]-1,direction]);
            this.resetChoices();
        }


    }


    arrToStr(arr){
        let me = [];
        me.push("[")
        for(let i = 0; i < arr.length;i++){
            if(arr[0].length>1)
                me.push("[");
            else 
                me.push("" + arr[i]);
            for(let j = 0; j < arr[0].length;j++){
                me.push(""+arr[i][j]);
                if(j != arr[0].length -1)
                    me.push(",");
            }
            if(arr[0].length>1)
                me.push("]")
            if(i != arr.length -1)
                me.push(",")
        }
        me.push("]")
        return me.join("");
    }


    checkDraw(){
        let board = this.arrToStr(this.board.b);
        this.server.send("checkDraw("+board+")",this.showDraw, null, this);
    }

    showDraw(){

        //NO DRAW SO ADVANCE TO NEXT PLAY
        if(this.status !== 200){
            this.game.nextPlayer();
            return;
        }

        //END GAME AND PRESENT DRAW
    }

    timeUp(){

        if(!this.madeMove)
            this.nextPlayer();
    }


    nextPlayer(){
        this.currentPlayer = (this.currentPlayer % 2) + 1;
        this.camera.waitForMove = false;
        this.clock.reset();
        this.madeMove = false;

    }


    checkGameOver(){

        console.log(this.board.b);

        let board = this.arrToStr(this.board.b);
        this.server.send("game_over("+board+"," + ( this.currentPlayer - 1) + "," + this.auxLength+ ")",this.gameOver, null, this);
    }

    gameOver(){

         //NO GAME OVER SO CHECK FOR DRAW
         if(this.status !== 200){
            this.game.checkDraw();
            return;
         }
        //END GAME AND PRESENT GAME OVER

        console.log('game over');
    }


    move(move){


        if(this.piece !== this.currentPlayer)
            return;

        console.log('yo');
        console.log('Move: ', move, 'Piece: ', this.piece);
        let board = this.arrToStr(this.board.b);
        let strMove = this.arrToStr(move);
        this.server.send("move("+strMove+","+this.piece+"," +board+  ",NewBoard)",this.applyMove,null,this);
        this.madeMove = true;
    }

    applyMove(){
        this.game.board.updateBoard(this.response);
        this.game.checkGameOver();
    }

   



    checkEndGame(move){
        
    }

    display(){
        this.board.display();
    }
}