class Game{
    constructor(scene,board){
        this.board=board;
        this.piece = 2;
        this.server = new Server();
        this.pieceToMove = null;
        this.destination = null;
        
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
        let piece = this.board.getBoardPiece(row,col);
        console.log(piece)
        if(this.pieceToMove ==null && piece != 0){
            this.pieceToMove=[row,col];
        }else if(this.pieceToMove!=null && piece==0){
            this.destination=[row,col];
            let direction = this.getChoice(this.pieceToMove,this.destination);
            this.move([this.pieceToMove[0]-1,this.pieceToMove[1]-1,direction]);
            this.resetChoices();
        }


    }



    getValidMoves(){

    }

    applyMove(){
        this.game.board.updateBoard(this.response);
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

    move(move){
        console.log(move)
        let board = this.arrToStr(this.board.b);
        let strMove = this.arrToStr(move);
        this.server.send("move("+strMove+","+this.piece+"," +board+  ",NewBoard)",this.applyMove,null,this);



    }

    checkEndGame(move){
        
    }

    display(){
        this.board.display();
    }
}