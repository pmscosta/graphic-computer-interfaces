class Game{
    constructor(scene,board){
        this.board=board;
        this.piece = 2;
        this.server = new Server();
        
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