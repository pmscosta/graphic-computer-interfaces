class Game {
    constructor(scene, board) {
        this.scene = scene;
        this.board = board;
        this.defaultBoard = [
            [0, 1, 0, 1, 0],
            [0, 0, 2, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 1, 0, 0],
            [0, 2, 0, 2, 0]
        ];
        this.server = new Server();
        this.pieceToMove = null;
        this.destination = null;
        this.currentPlayer = 2;
        this.auxLength = this.board.b.length;
        this.mode = "Player vs Player";
        this.bot1Dif = "Minimax";
        this.bot2Dif = "Minimax";
        this.pastBoards = [];
        this.savePlay(this.board.b, this);
        this.clock = null;
        this.counter = null;
        this.last = 0;
        this.gameOverFlag = false
        this.botTurn = true
        this.receivedAnswer = true
        this.botMult = 5
        this.started = false;
    }

    changeMode(mode) {
        //console.log("Changes to mode ", mode);
        this.mode = mode;
    }

    changeBot1Dif(dif) {
        //console.log("Changes to bot1dif ", dif);
        this.bot1Dif = dif;
    }

    changeBot2Dif(dif) {
        //console.log("Changes to bot2dif ", dif);
        this.bot2Dif = dif;
    }

    init() {
        this.camera = new RotateCamera(this.scene.getGameCamera(), [0, 1, 0]);
        this.server.send("reset", null, null, this);
        this.clock.pause = true;
    }

    changeCamera(camera) {
        this.camera.change(camera);
    }


    update(time) {

        this.last += time;
        this.camera.orbitCamera(time);
        this.board.update(time);

        if (this.gameOverFlag)
            return



        if (this.last < 50000 / (this.botMult + 1))
            return;

        if (this.mode == "Bot vs Player" && this.receivedAnswer && !this.botTurn) {
            this.botTurn = true;
            this.receivedAnswer = false
        }

        if (this.mode == "Bot vs Player" && this.botTurn && this.receivedAnswer) {
            this.playBot(this)
            this.botTurn = false;
            this.receivedAnswer = false
        }

        if (this.mode == "Bot vs Bot") {
            this.playBot(this)
            this.last = 0;
        }




    }

    getChoice(source, dest) {
        let x = dest[0] - source[0],
            y = dest[1] - source[1];
        if (x != 0)
            x = x / Math.abs(x)
        if (y != 0)
            y = y / Math.abs(y);


        let dif = [x, y];
        let moveMap = new Object();
        moveMap[[-1, 1]] = 9;
        moveMap[[1, 0]] = 2;
        moveMap[[-1, 0]] = 8;
        moveMap[[0, 1]] = 6;
        moveMap[[0, -1]] = 4;
        moveMap[[1, -1]] = 1;
        moveMap[[-1, -1]] = 7;
        moveMap[[1, 1]] = 3;
        moveMap[[0, 0]] = 0;
        return moveMap[dif];

    }

    resetChoices() {
        this.destination = null;
        this.pieceToMove = null;
    }

    assignChoice(row, col) {

        if (!this.started)
            return;

        let piece = this.board.getBoardPiece(row, col)
        if (piece != 0 && piece == this.currentPlayer) {
            this.pieceToMove = [row, col];
            this.piece = piece;
            this.board.calculatePossibleMoves(this.pieceToMove);
        } else if (this.pieceToMove != null && piece == 0) {
            this.destination = [row, col];
            let direction = this.getChoice(this.pieceToMove, this.destination);
            this.move([this.pieceToMove[0] - 1, this.pieceToMove[1] - 1, direction]);
            this.resetChoices();
        }


    }

    resetGame() {
        this.server.send("reset", null, null, this);
        this.board.reset(this.defaultBoard);
        this.gameOverFlag = false;
        this.currentPlayer = 2;
        this.camera.reset();
        this.botTurn = true
        this.pastBoards = [];
        this.savePlay(this.board.b, this);
        this.clock.reset();
        this.started = true;
    }

    undo() {

        let board = this.arrToStr(this.board.b);

        this.server.send("undo(" + board +")", null, null, this);

        console.log(this.pastBoards)

        if (this.pastBoards.length < 2) return;

        let toSave = this.pastBoards.pop();

        console.log(this.pastBoards)

        let lastPlay = this.pastBoards.pop();
        console.log("last play", lastPlay)

        console.log(this.board.getDif(this.board.b, lastPlay[0]));

        this.board.updateBoard2(lastPlay[0])

        this.savePlay(this.board.b, this)

        this.gameOverFlag = false;


        this.nextPlayer();

        //this.currentPlayer = (this.currentPlayer % 2) + 1


    }

    arrToStr(arr) {
        let me = [];
        me.push("[")
        for (let i = 0; i < arr.length; i++) {
            if (arr[0].length > 1)
                me.push("[");
            else
                me.push("" + arr[i]);
            for (let j = 0; j < arr[0].length; j++) {
                me.push("" + arr[i][j]);
                if (j != arr[0].length - 1)
                    me.push(",");
            }
            if (arr[0].length > 1)
                me.push("]")
            if (i != arr.length - 1)
                me.push(",")
        }
        me.push("]")
        return me.join("");
    }


    checkDraw() {
        let board = this.arrToStr(this.board.b);
        this.server.send("checkDraw(" + board + ")", this.showDraw, null, this);
    }

    showDraw() {

        //NO DRAW SO ADVANCE TO NEXT PLAY
        if (this.status !== 200) {
            this.game.nextPlayer();
            return;
        }

        console.log("DRAWWWWWWWWWWWWWWW");

        this.game.gameOverFlag = true;
        //END GAME AND PRESENT DRAW
    }

    timeUp() {

        if (!this.madeMove)
            this.nextPlayer();
    }


    nextPlayer() {
        if (this.mode == "Player vs Player") {
            this.camera.waitForMove = false;
        }

        console.log(this);

        this.clock.reset();
        this.madeMove = false;
        this.currentPlayer = (this.currentPlayer % 2) + 1


    }


    checkGameOver(game) {
        let board = game.arrToStr(game.board.b);
        game.server.send("game_over(" + board + "," + (game.currentPlayer - 1) + "," + game.auxLength + ")", game.gameOver, null, game);
    }

    playMovie() {

        if(!this.gameOverFlag)
            return;

        this.board.reset(this.defaultBoard);
        
        this.board.playMovie(this.pastBoards);
    }


    gameOver() {
        //NO GAME OVER SO CHECK FOR DRAW
        if (this.status !== 200) {
            this.game.receivedAnswer = true
            this.game.checkDraw();
            return;
        }
        //END GAME AND PRESENT GAME OVER
        console.log("GAME OVER")
        this.game.clock.pause = true;
        this.game.gameOverFlag = true;
        this.game.board.setGameOverStatus(this.game.currentPlayer);
        this.game.receivedAnswer = true;
        this.game.counter.updateScore(this.game.currentPlayer);
    }



    move(move) {
        console.log("Piece: ", this.piece)
        console.log("Current Player: ", this.currentPlayer)
        console.log("Flag: ", this.gameOverFlag)
        if (this.piece !== this.currentPlayer || this.gameOverFlag)
            return;

        let board = this.arrToStr(this.board.b);
        let strMove = this.arrToStr(move);
        this.server.send("move(" + strMove + "," + this.piece + "," + board + ",NewBoard)", this.applyMove, null, this);
        this.madeMove = true;
    }



    test() {
        console.log("Resposta", this.response)
        this.game.board.updateBoard(this.response);
        this.game.checkGameOver(this.game);
        this.game.savePlay(JSON.parse(this.response), this.game)


    }


    savePlay(board, game) {
        let newBoard = board;

        let white = [];
        game.board.whitePieces.forEach(element => {
            white.push(new WhitePiece(game.scene, [...element.position], game.board.points));
        });

        let black = [];
        game.board.blackPieces.forEach(element => {
            black.push(new BlackPiece(game.scene, [...element.position], game.board.points));
        });


        game.pastBoards.push([newBoard, white, black]);
    }



    applyMove() {
        this.game.board.updateBoard(this.response);
        this.game.checkGameOver(this.game);
        //this.game.currentPlayer = (this.game.currentPlayer % 2) + 1
        this.game.savePlay(JSON.parse(this.response), this.game)

        //console.log(this.response)

        if (this.game.mode == "Player vs Bot") {
            this.game.playBot(this.game)
        }

    }

    playBot(game) {
        let board = game.arrToStr(game.board.b);
        let message = "botPlay(" + board + "," + (game.currentPlayer - 1) + ",2,OutTab)"
        game.server.send(message, game.test, null, game);
    }


    checkEndGame(move) {

    }



    display() {
        this.board.display();
    }
}