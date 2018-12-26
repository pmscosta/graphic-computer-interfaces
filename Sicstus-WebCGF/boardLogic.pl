:- use_module(library(lists)).
:- dynamic map/2.
/**
			===================================
			======= Movement Translate ========
			===================================
	the user inputs a number from the numpad.
	the movement direction will follow the one from the numpad,
	e.g., 1 means down and left. so we have to go back in the columns 
	and forward in the rows, that menans 1 becomes -> (col: -1, row: 1).
**/

colTranslate(1, -1).
colTranslate(2, 0).
colTranslate(3, 1).
colTranslate(4, -1).
colTranslate(6, 1).
colTranslate(7, -1).
colTranslate(8, 0).
colTranslate(9, 1).

rowTranslate(1, 1).
rowTranslate(2, 1).
rowTranslate(3, 1).
rowTranslate(4, 0).
rowTranslate(6, 0).
rowTranslate(7, -1).
rowTranslate(8, -1).
rowTranslate(9, -1).

/*
			===================================
*/



/**
			===================================
			=== Matrix Operations Utilities ===
			===================================
 **/

/**
 * replaceElemMatrix(+Row, +Col, +Elem, +Matrix, -OutMatrix)
 * 
 * When the reach the specific row, start iterating the columns.
 * */

replaceElemMatrix(0, Col, Elem, [L|Ls], [R|Ls]):-
	replaceElemCol(Col, Elem, L, R).

/**
 * replaceElemMatrix(+Row, +Col, +Elem, +Matrix, -OutMatrix)
 * 
 * Creates a new matrix (OutMatrix) by replacing an older
 * 	 matrix elem in row Row and column Col by Elem.
 *
 * Starts by iterating all the rows until the one wanted is met.
 * */
replaceElemMatrix(Row, Col, Elem, [L|Ls], [L|Rs]):-
	Row > 0, 
	NRow is Row - 1, 
	replaceElemMatrix(NRow, Col, Elem, Ls, Rs).


/**
 * replaceElemCol(Col, Elem, +Row, -OutRow)
 * 
 * When we get to the Col we want, replace it.
 */
replaceElemCol(0, Elem , [_|Cs], [Elem|Cs]).

/**
 * replaceElemCol(Col, Elem, +Row, -OutRow)
 * 
 * Creates a new row by replacing and older row elemnt
 * 	 in the position Col by Elem.
 * 
 * Starts iterating the row until the one wanted is met
 */
replaceElemCol(Col, Elem, [C|Cs], [C|Rs]):-
	Col > 0, 
	NCol is Col - 1, 
	replaceElemCol(NCol, Elem, Cs, Rs).

/**
 * getPiece(+Row, +Col, +Board, -Elem)
 * 
 * Retrives a board piece in row Row and col Col, storing it in Elem
 * */
getPiece(Row, Col, Board, Elem):-
	nth0(Row, Board, RowList),
	nth0(Col, RowList, Elem).




getRowN([H|_], 0, H):- !.

/**
 * getRowN(+Board, +Index, -Elem)
 * 
 * Retrieves and element from a row at posiion Index
 * 
 * 
 * */
getRowN([_|T], N, X) :-
	N1 is N - 1, 
	getRowN(T, N1, X).

getColumnN([], _, []).
/**
 * getColumnN(+Board, +Index, -Col)
 * Retrives a column from the board at index Index. 
 * 
 * Iterates all the rows searching for the element in that row in position Index
 */
getColumnN([H|T], N, [R|X]):-
	getRowN(H, N, R),
	getColumnN(T, N, X).


/**getDiagonal(+Board, -Diag, -UpDiag, -SecDiag, -SecUpDiag, +Offset)
 * 
 * Returns all the boards diagonals (from right to left and left to right).
 * Allows for an offset to be specified. We might not want only the main diagonal, 
 * but one that is one column above that one.
 * E.g.
			[ 01, 02, 03, 04 ]
			[ 05, 06, 07, 08 ]
			[ 09, 10, 11, 12 ]
			[ 13, 14, 15, 16 ]
		
	With offset = 1, we would obtain the following diagonals
		:Diag = [05, 10, 15]
		:UpDiag = [02, 07, 12]
		:SecDiag = [08, 11, 14]
		:SecUpDiag = [03, 06, 09]
			
 * 
 * */
getDiagonal(Board, Diag, UpDiag, SecDiag, SecUpDiag, Offset):-
	length(Board, K), 
	N is K - 1,
	findall(A, (between(Offset, N, I), nth0(I, Board, Row), I2 is I - Offset, nth0(I2, Row, A)), Diag),
	findall(B, (between(Offset, N, I), nth0(I, Board, Row), J is N - I + Offset, nth0(J, Row, B)), SecDiag ),
	NegativeOffset is 0 - Offset, 
	findall(C, (between(NegativeOffset, N, I), nth0(I, Board, Row),  I2 is I - NegativeOffset, nth0(I2, Row, C)), UpDiag),
	findall(D, (between(Offset, N, I), I1 is I - Offset, nth0(I1, Board, Row), J is N - I, nth0(J, Row, D)), SecUpDiag).


/**
 * sublist( +Sublist, +List ). 
 * Implementation of sublist predicate using append
 * @param Sublist - Sublist to see if it's inside List
 * @param List - List to check if Sublist is inside
 */ 
sublist( Sublist, List ) :-
    append( [_, Sublist, _], List ).

/**
 * checkEmpty(+Board,+NextRow,+NextCol).
 * Check if board element specified is empty
 * @param Board - Current Board
 * @param NextRow - Row of element to check
 * @param NextCol - Col of element to check
 */
checkEmpty(Board,NextRow,NextCol):-
	getPiece(NextRow, NextCol, Board, NextPiece), 
	NextPiece=:=0.

/*
			===================================
*/




/**
			===================================
			== Movement Operations Utilities ==
			===================================
 **/

/**
 * checkBoundaries(+Position, +Lenght).
 * Check if position is inside Board Boundaries 
 * @param Position - Position to check (Dimension)
 * @param Lenght - Board Length
 */
checkBoundaries(Position, Lenght):-
	LengthArray is Lenght - 1, 
	(
		Position < 0, Position = 0, !;
		Position > LengthArray, Position = LengthArray, !;
		true
	).


/**
 * move(+Move, +Piece, +Board, -NewBoard).
 * Moves the piece with the move, returning the resulting board (OutBoard)
 * @param Move - Move to take
 * @param Piece - Piece to move
 * @param Board - Current Board
 * @param NewBoard - Resulting board
 */
move(Move, Piece, Board, NewBoard):-
	Move = [Row, Col, Dir],
	colTranslate(Dir, MoveCol),
	rowTranslate(Dir, MoveRow),
	replaceElemMatrix(Row, Col, 0, Board, NBoard),
	length(Board, N),
	movePiece(Row, Col, MoveCol, MoveRow, Piece, NBoard, NewBoard, N).

/**
 * movePiece(+Row, +Col, +MoveCol, +MoveRow, +Piece, +Board, -OutBoard, +BoardLength).
 * Checks if move is possible, updates board and moves the piece returning the resulting board
 * @param Row - Current row of the piece to move
 * @param Col - Current col of the piece to move
 * @param MoveCol - Distance to Next Col
 * @param MoveRow - Distance to Next Row
 * @param Piece - Current Piece
 * @param Board - Current Board
 * @param OutBoard - Resulting Board
 * @param BoardLength - Board Length
 */
movePiece(Row, Col, MoveCol, MoveRow, Piece, Board, OutBoard, BoardLength):-
	NextRow is Row + MoveRow, 
	NextCol is Col + MoveCol, 
	checkBoundaries(NextRow, BoardLength),
	checkBoundaries(NextCol, BoardLength),
	getPiece(NextRow, NextCol, Board, NextPiece), 
	NextPiece = 0, !,
	movePiece(NextRow, NextCol, MoveCol, MoveRow, Piece, Board, OutBoard, BoardLength);
	replaceElemMatrix(Row, Col, Piece, Board, OutBoard).

/**
 * valid_move(+Board,+Player,+Row,+Col,+Move, +Piece).
 * Checks if move valid to take, checking input, and move following the game logic
 * @param Board - Current Board
 * @param Player - Current Player
 * @param Row - Current Row of the Piece
 * @param Col - Current Col of the Piece
 * @param Move - Move to test
 * @param Piece - Piece to move
 */
valid_move(Board,Player,Row,Col,Move, Piece):-
	between(1, 9, Move),
	Move \= 5,
	Piece =:= (Player + 1),
	colTranslate(Move, MoveCol),
	rowTranslate(Move, MoveRow),
	NextRow is Row + MoveRow, 
	NextCol is Col + MoveCol, 
	length(Board, BoardLength),
	checkBoundaries(NextRow, BoardLength),
	checkBoundaries(NextCol, BoardLength),
	checkEmpty(Board,NextRow,NextCol). 

/**
 * valid_moves(+Board,+Player,-ListOfMoves).
 * Finds all valid moves regarding the player to play
 * @param Board - Current Board
 * @param Player - Current Player
 * @param ListOfMoves - List of valid moves to take
 */
valid_moves(Board, Player, ListOfMoves):-
	NPiece is Player + 1, 
	findall([Row, Col, Move], ( getPiece(Row, Col, Board, NPiece),
								valid_move(Board, Player, Row, Col, Move, NPiece)), 
								ListOfMoves).

/**
 * move_and_evaluate(+Board,+Player,-BestMove).
 * Finds all valid moves including the value from the move regarding the player to play including, ordered by higher value 
 * Returns the highest scoring Move
 * @param Board - Current Board
 * @param Player - Current Player
 * @param BestMove - The highest scoring move
 */
move_and_evaluate(Board, Player, BestMove):-
	length(Board, N),
	K is N - 1, 
	NPiece is Player + 1, 
	findall([Value, Row, Col, Move],( getPiece(Row, Col, Board, NPiece), 
								valid_move(Board, Player, Row, Col, Move, NPiece), 
								move([Row, Col, Move], NPiece, Board, OutTab),
								value(OutTab, Player, Value, K)), Moves),
	sort(Moves, TempMoves),
	reverse(TempMoves, MovesList), 
	nth0(0, MovesList, Temp), 
	Temp = [_, A, B, C],
	BestMove = [A, B, C].

/*
			===================================
*/

/**
			===================================
			========== Draw Conditions ========
			===================================
 **/

/**
 * checkDraw(+Tab).
 * Checks if a draw occurs
 * @param Tab - Current Board
 */
checkDraw(Tab):-

	flatten2(Tab, List),

	(
		retract( map(List,N) ),
		NewN is N + 1,
		assertz( map(List, NewN) );
		NewN is 1, 
		assertz(map(List, NewN))
	), 
	NewN > 2.
	

flatten2([], []):- !.

/**
 * flatten2(+Matrix, -List)
 * 
 * Collapses a Matrix (List of lists) into a single list
 * */
flatten2([L|Ls], Flat):-
	!,
	flatten2(L, NewL),
	flatten2(Ls, NewLs),
	append(NewL, NewLs, Flat).
flatten2(L, [L]).

/**
 * drawGame.
 * Prints draw message and returns to main menu
 */
drawGame:-
	write('The same position occurred 3 times!'), nl, 
	write('This match is a draw!'), nl, 
	write('Press Enter to continue'), 
	waitForKeyPress, !,
	mainMenu.


/**
			===================================
			======== Victory Conditions =======
			===================================
 **/

/**
 * game_over(+Tab,+Player,+Length).
 * Checks if a victory occurs
 * @param Tab - Current Board
 * @param Player - Current Player
 * @param Length - Board Length
 */
game_over(Board, Player, Length):-
	K is Length - 1,
	(
		checkColumns(Board, Player, K);
		checkRows(Board, Player, K);
		checkBiggerDiagonals(Board, Length, Player)
	).

/**
 * wonGame(+Player).
 * Prints specific player win message and returns to main menu 
 * @param Player - Winning Player
 */
wonGame(Player):-
	write('Player '), write(Player), write(' won!'), nl, 
	write('Press Enter to continue'), 
	waitForKeyPress, !, 
	mainMenu.

/**
 * isConnected(+Player,+List).
 * Checks if the same piece is repeated 3 times on a row
 * @param Player - Player to check
 * @param List - List of pieces
 */
isConnected(Player, List):-
	Piece is Player + 1,
	sublist([Piece, Piece, Piece], List).

/**
 * checkColumns(+Tab,+Player,+N).
 * Checks if the same piece is repeated 3 times on a row in any column
 * @param Tab - Current Board 
 * @param Player - Player to check 
 * @param N - Board Length
 */
checkColumns(Tab, Player, N):-
	between(0, N, N1), 
	getColumnN(Tab, N1, Col), 
	isConnected(Player, Col).

/**
 * checkColumns(+Tab,+Player,+N).
 * Checks if the same piece is repeated 3 times on a row in any row
 * @param Tab - Current Board 
 * @param Player - Player to check 
 * @param N - Board Length
 */
checkRows(Tab, Player, N):-
	between(0, N, N1), 
	nth0(N1, Tab, Row), 
	isConnected(Player, Row).

/**
 * checkBiggerDiagonals(+Tab,+Length,+Player).
 * Checks if the same piece is repeated 3 times on a row in any diagonal
 * @param Tab - Current Board 
 * @param Length - Board Length
 * @param Player - Player to check 
 */
checkBiggerDiagonals(Tab, Length, Player):-
	K is Length - 2,
	between(0, K, Offset), 
	getDiagonal(Tab, D, UpD, SecD, SecUpD, Offset),  
	(
		isConnected(Player, D);
		isConnected(Player, UpD);
		isConnected(Player, SecD);
		isConnected(Player, SecUpD)
	).

/*
			===================================
*/