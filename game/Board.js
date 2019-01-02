class Board extends CGFobject {
    /**
     * @param  {XML Scene} scene
     */
    constructor(scene, points) {
        super(scene);
        this.scene = scene;
        this.plane = new Plane(this.scene, 20, 20);
        this.marker = new MyRectangle(this.scene, [0, 0.3, 0.3, 0], 0, 1, 0, 1);
        this.green_area = new MyRectangle(this.scene, [0, 0.3, 0.3, 0], 0, 1, 0, 1);
        this.green_areas = null;
        this.currentPlayer = null;
        this.points = points;

        this.mat = this.scene.graph.materials['table_wood'];
        this.greenMat = new CGFappearance(this.scene);

        this.greenMat.setAmbient(0, 1, 0, 1);
        this.greenMat.setDiffuse(0, 1, 0, 1);
        this.greenMat.setSpecular(0, 1, 0, 1);
        this.greenMat.setEmission(0, 0, 0, 0);
        this.greenMat.setShininess(0.1);

        this.whitePieces = [new WhitePiece(this.scene, [2, 3], this.points), new WhitePiece(this.scene, [1, 0], this.points), new WhitePiece(this.scene, [3, 0], this.points)];
        this.blackPieces = [new BlackPiece(this.scene, [2, 1], this.points), new BlackPiece(this.scene, [1, 4], this.points), new BlackPiece(this.scene, [3, 4], this.points)];

        this.gameOverFlag = false;
        this.draw = false;

        this.won_graphic = new MyRectangle(this.scene, [-1.5, -1.5, 1.5, 1.5]);

        this.mat_won = new CGFappearance(this.scene);
        this.mat_won.setShininess(100);
        this.mat_won.setEmission(1, 1, 1, 1);
        this.mat_won.setTexture(this.scene.graph.textures['joao_won']);

        this.mat_draw = new CGFappearance(this.scene);
        this.mat_draw.setShininess(100);
        this.mat_draw.setEmission(1, 1, 1, 1);
        this.mat_draw.setTexture(this.scene.graph.textures['draw_game']);

        this.b = this.getBoard();
    };


    findingNeighbors(myArray, i, j) {
        var rowLimit = myArray.length - 1;
        var columnLimit = myArray[0].length - 1;

        let green_areas = [];

        for (var x = Math.max(0, i - 1); x <= Math.min(i + 1, rowLimit); x++) {
            for (var y = Math.max(0, j - 1); y <= Math.min(j + 1, columnLimit); y++) {

                if ((x !== i || y !== j) && myArray[x][y] == 0) {
                    green_areas.push({
                        x: x,
                        y: y
                    });
                }
            }
        }

        return green_areas;

    }

    calculatePossibleMoves(selected) {

        let i = selected[0] - 1;
        let j = selected[1] - 1;

        this.green_areas = this.findingNeighbors(this.b, i, j);
    }

    displayGreenAreas() {
        this.green_areas.forEach(area => {
            let j = area.x;
            let i = area.y;

            this.scene.pushMatrix();

            this.scene.translate(this.points[0], 0, this.points[2]);
            this.scene.translate(0.4 * i + this.points[0], 0.01 + this.points[1], 0.4 * j + this.points[2]);
            this.scene.translate(0.05, 0, 0.05);

            this.scene.registerForPick((i + 1) * 10 + (j + 1), this.marker);
            this.scene.rotate(Math.PI / 2, 1, 0, 0);
            this.greenMat.apply();
            this.marker.display();
            this.scene.popMatrix();
        });
    }


    getBoardPiece(row, col) {
        return this.b[row - 1][col - 1];
    }

    getPiece(piece, pos) {
        let res = null;
        let list = null;

        if (piece == 2)
            list = this.blackPieces;
        else
            list = this.whitePieces;

        list.forEach(function (p) {
            if (p.position[0] == pos[0] && p.position[1] == pos[1])
                res = p;
        });


        return res;
    }

    getDif(oldB, newB) {

        let state = []

        for (let i = 0; i < oldB.length; i++) {
            for (let j = 0; j < oldB[i].length; j++) {
                if (oldB[i][j] != newB[i][j]) {
                    //if it is different and it is 0 on the old board, it is the new position of the piece
                    if (oldB[i][j] == 0) {
                        state['newCell'] = [j, i];
                    }
                    //else it is the position where that piece was before the movement
                    else {
                        // console.log("[" + j + "," + i + "]  =  "  + oldB[i][j] , this.getPiece(oldB[i][j], [j, i]))
                        state['piece'] = this.getPiece(oldB[i][j], [j, i]);
                    }
                }
            }
        }
        return state;
    }


    playMovie(boards) {

        for (let i = 1; i < boards.length; i++) {


            (function (i, a) {
                setTimeout(function () {
                    let board = boards[i][0];

                    console.log({
                        board
                    });

                    a.updateBoard2(board);
                }, 500 * i);
            })(i, this);

        }
    }

    updateBoard(newBoard) {

        console.log(this.currentPlayer);

        newBoard = JSON.parse(newBoard);
        console.log(this.b, newBoard)

        let state = this.getDif(this.b, newBoard);

        this.b = newBoard;

        state['piece'].addAnimation({
            first: state['piece'].position,
            end: state['newCell']
        });

        this.green_areas = null;

    }

    updateBoard2(newBoard) {

        // console.log(this.b,newBoard)

        let state = this.getDif(this.b, newBoard);
        //console.log(state)
        this.b = newBoard;

        state['piece'].addAnimation({
            first: state['piece'].position,
            end: state['newCell']
        });

        this.green_areas = null;

    }

    getBoard() {
        let b = [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0]
        ];

        this.whitePieces.forEach(p => b[p.position[1]][p.position[0]] = 1);
        this.blackPieces.forEach(p => b[p.position[1]][p.position[0]] = 2);

        return b;
    }

    display() {
        this.scene.pushMatrix();
        this.scene.scale(2, 1, 2);
        this.scene.translate(0.5, 0, 0.5);
        this.scene.translate(this.points[0], this.points[1], this.points[2]);
        this.plane.display();
        this.scene.popMatrix();

        if (this.scene.pickMode) {
            this.placePickingSquare();
        }

        if (this.green_areas != null) {
            this.displayGreenAreas();
        }

        this.displayPieces();


        if (this.gameOverFlag || this.draw)
            this.displayFinal();
    }
    placePickingSquare() {

        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                this.scene.pushMatrix();
                this.scene.translate(this.points[0], 0, this.points[2]);
                this.scene.translate(0.4 * i + this.points[0], 0.01 + this.points[1], 0.4 * j + this.points[2]);
                this.scene.translate(0.05, 0, 0.05);

                this.scene.registerForPick((i + 1) * 10 + (j + 1), this.marker);
                this.scene.rotate(Math.PI / 2, 1, 0, 0);
                this.marker.display();
                this.scene.popMatrix();
            }
        }
    }

    displayPieces() {

        this.scene.pushMatrix();

        this.scene.translate(this.points[0], 0, this.points[2]);

        this.whitePieces.forEach(element => {
            element.display();
        });

        this.blackPieces.forEach(element => {
            element.display();
        });


        this.scene.popMatrix();
    }

    setGameOverStatus(player) {


        console.log(player);

        if (player != 0)
            this.gameOverFlag = true;
        else
            this.draw = true;

        //console.log('GAME OVER FLAGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG', this.gameOverFlag);  

        this.messageAngle = (player % 2) * Math.PI;
    }

    displayFinal() {
        this.scene.pushMatrix();
        this.scene.translate(this.points[0] + 2.7, this.points[1] + 1.3, this.points[2] + 2.5)
        this.scene.scale(1, 0.5, 1);
        this.scene.rotate(this.messageAngle, 0, 1, 0);
        if (this.gameOverFlag) {
            this.mat_won.apply();
            this.won_graphic.display();
        } else if (this.draw) {
            //SHOW FOR BOTH PLAYERS
            this.mat_draw.apply();
            this.won_graphic.display();
            this.scene.rotate(Math.PI, 0, 1, 0);
            this.won_graphic.display();
        }
        this.scene.popMatrix();
    }

    updateTexCoords(dummy1, dummy2) {

    }

    update(time) {

        this.whitePieces.forEach(element => {
            element.update(time);
        });

        this.blackPieces.forEach(element => {
            element.update(time);
        });
    }

    reset(defaultBoard) {

        this.gameOverFlag = false;
        this.draw = false;
        this.green_areas = null;
        this.b = defaultBoard;
        this.whitePieces = [new WhitePiece(this.scene, [2, 3], this.points), new WhitePiece(this.scene, [1, 0], this.points), new WhitePiece(this.scene, [3, 0], this.points)];
        this.blackPieces = [new BlackPiece(this.scene, [2, 1], this.points), new BlackPiece(this.scene, [1, 4], this.points), new BlackPiece(this.scene, [3, 4], this.points)];
    }
};