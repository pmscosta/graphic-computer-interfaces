class Game{
    constructor(scene,board){
        this.scene = scene;
        this.board=board;
        this.defaultBoard = [...board.b];
        this.server = new Server();
        this.pieceToMove = null;
        this.destination = null;
        this.currentPlayer = 2;
        this.auxLength = this.board.b.length;
        this.mode = "Player vs Player";
        this.bot1Dif = "Random";
        this.bot2Dif = "Minimax";
        this.pastBoards = [];
        this.savePlay(this.board.b,this);
        this.clock = null;
        
        
    }

    changeMode(mode){
        //console.log("Changes to mode ", mode);
        this.mode=mode;
    }

    changeBot1Dif(dif){
        //console.log("Changes to bot1dif ", dif);
        this.bot1Dif=dif;
    }

    changeBot2Dif(dif){
        //console.log("Changes to bot2dif ", dif);
        this.bot2Dif=dif;
    }

    init(){
        this.camera = new RotateCamera(this.scene.getGameCamera(), [0, 1, 0]);
    }

    changeCamera(camera){
        this.camera.change(camera);
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
        if(piece != 0 && piece == this.currentPlayer){
            this.pieceToMove=[row,col];
            this.piece = piece;
            this.board.calculatePossibleMoves(this.pieceToMove);
        }else if(this.pieceToMove!=null && piece ==0){
            this.destination=[row,col];
            let direction = this.getChoice(this.pieceToMove,this.destination);
            this.move([this.pieceToMove[0]-1,this.pieceToMove[1]-1,direction]);
            console.log("Moving")
            this.resetChoices();
        }


    }

    resetGame(){
        this.board.reset(this.defaultBoard);
    }

    undo(){

        if(this.pastBoards.length<2) return;

        let toSave = this.pastBoards.pop();
        let lastPlay = this.pastBoards.pop();

        this.board.b =lastPlay[0];
        this.board.whitePieces = lastPlay[1];
        this.board.blackPieces = lastPlay[2];

        this.pastBoards.push(toSave)

        if(this.mode != "Player vs Player"){
            botPlay(this.game);
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
        if(this.mode =="Player vs Player"){
            this.camera.waitForMove = false;
            this.currentPlayer =  (this.game.currentPlayer % 2) + 1
        }
        this.clock.reset();
        this.madeMove = false;

    }


    checkGameOver(){
        let board = this.arrToStr(this.board.b);
        this.server.send("game_over("+board+"," + ( this.piece) + "," + this.auxLength+ ")",this.gameOver, null, this);
    }

    gameOver(){

         //NO GAME OVER SO CHECK FOR DRAW
         if(this.status !== 200){
            this.game.checkDraw();
            return;
         }
        //END GAME AND PRESENT GAME OVER
        
        this.game.scene.interface.status="Game Over";
    }


    move(move){

        console.log("Piece", this.piece)
        console.log("Current Player", this.currentPlayer )
        if(this.piece !== this.currentPlayer)
            return;

        console.log('yo');
        console.log('Move: ', move, 'Piece: ', this.piece);
        let board = this.arrToStr(this.board.b);
        let strMove = this.arrToStr(move);
        this.server.send("move("+strMove+","+this.piece+"," +board+  ",NewBoard)",this.applyMove,null,this);
        this.madeMove = true;
    }



    test(){
        console.log("Resposta" , this.response)
        this.game.board.updateBoard(this.response);
        this.game.checkGameOver();
        this.game.savePlay(JSON.parse(this.response),this.game)


        this.game.currentPlayer =  (this.game.currentPlayer % 2) + 1
        this.madeMove = true;

    }


    savePlay(board,game){
        let newBoard = board;

        let white=[];
        game.board.whitePieces.forEach(element => {
            white.push(new WhitePiece(game.scene,[...element.position],game.board.points));
        });

        let black=[];
        game.board.blackPieces.forEach(element => {
            black.push(new BlackPiece(game.scene,[...element.position],game.board.points));
        });


        game.pastBoards.push([newBoard,white,black]);
        console.log(game.pastBoards)
    }
    applyMove(){
        console.log("First response: " , this.response)
        this.game.board.updateBoard(this.response);
        this.game.checkGameOver();
        
        this.game.currentPlayer =  (this.game.currentPlayer % 2) + 1
        this.game.savePlay(JSON.parse(this.response),this.game)

        if(this.game.mode != "Player vs Player"){
            this.game.playBot(this.game)
        }
        
    }

    playBot(game){
        
        let board = game.arrToStr(game.board.b);
        let message = "botPlay(" + board + "," + (game.currentPlayer -1) + ",1,OutTab)"
        game.server.send(message,game.test,null,game);
    }


    checkEndGame(move){
        
    }

    display(){
        this.board.display();
    }
}