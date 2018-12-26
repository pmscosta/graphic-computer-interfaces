/**
			===================================
			============= Bot Play ============
			===================================
 **/

/**
 * botPlay(+Tab, +Player, -OutTab).
 * Plays the random bot 
 * Calculates all the possible moves and selects a random one.
 * @param Tab - Current Board
 * @param Player - Current Player
 * @param OutTab - Board after bot play
 **/
botPlay(Board, Player, Level, OutBoard):-
	(
		Level \= 3, !,
			choose_move(Board, Player, Level, Move), 
			Piece is Player + 1, 
			move(Move, Piece, Board, OutBoard)
		;
		minimax(Board, Player, 1, 2, _, OutBoard)
	).

/**
 * choose_move(+Board, +Player, +Level, -Move)
 * 
 * Places in Move the next move to be done by the bot.
 * Depending on the level (1->random, 2->greedy), selects the move differently.
 * 
 * If it is Level 1: selects a random move from the valid ones
 * Else, selects the best move of all the valid ones, given the value function.
 * 
 * */
choose_move(Board, Player, Level, Move):-
	(
		Level = 1,
			valid_moves(Board, Player, MovesList),
			length(MovesList, L), 
			random(0, L, Index), 
			nth0(Index, MovesList, Move);
		Level = 2, 
			move_and_evaluate(Board, Player, Move)
	).
/*
			===================================
*/




/**
			===================================
			===== Bot Heuristic Functions =====
			===================================
 **/

/*
 * value(+Tab, +Player, -Value, +Length).
 * Evaluates the board following an heuristic.
 * The heuristcs takes in consideration the following main points:
 * 			-if it can win with such moves, gives it the highest value possible, 1000.
 *          -gives 15 points for each two pieces connected (be it in a row, column or diagonal)
 *          -calculates how many other valid moves there are after that board and adds it to score
 * 					(if there are 10 valid moves after, value += 10)
 * 			-does the same as the previous point, but for enemy moves, subtracting that valeu
 * @param Tab - Board to evaluate
 * @param Player - Current Player
 * @param Value - Board value following the heuristic
 * @param Length - Length of the board
*/
value(Tab, Player, Value, Length):-
		game_over(Tab, Player, Length),	Value = 1000;
		nextPlayer(Player, NextPlayer), 
		game_over(Tab, NextPlayer, Length), Value = -1000;
		(
		checkDraw(Tab), !, resetMap(Tab), value = 0;
			resetMap(Tab), fail
		);		
		checkTwoConnected(Tab, Player, Length, Total),
		Total15 is Total * 15, 
		valid_moves(Tab, Player, MovesList),
		nextPlayer(Player, NextPlayer), 
		valid_moves(Tab, NextPlayer, EnemyMoves),
		length(MovesList, N),
		length(EnemyMoves, E),
		Value is Total15 + N - E.

/**
 * resetMap(+Tab)
 * Decrements a Board appearence in our dynamic predicate map by 1.
 * Useful when we test for a draw.
 * @param Tab - the board to be tested
 */
resetMap(Tab):-
	flatten2(Tab, List), 
	retract(map(List, N)), 
	NewN is N - 1, 
	assertz(map(List, NewN)).

/**
 * evaluateMove(+Tab, +Player, +Move, -Value, +Length, -OutTab).
 * Evaluates a move following an heuristic
 * @param Tab - Current Board 
 * @param Player - Current Player 
 * @param Move - Move to evaluate 
 * @param Value - Value from taking the move following the heuristic
 * @param Length - Length of the board
 * @param OutTab - Board after taking the move    
 **/
evaluateMove(Tab, Player, Move, Value, Length, OutTab):-
	Move = [Row, Col, Move],
	Piece is Player + 1,
	move([Row, Col, Move], Piece, Tab, OutTab),
	value(OutTab, Player, Value, Length).


/**
 * checkTwoConnected(+Tab, +Player, +Length, -TotalConnected).
 * Checks if there are two pieces connected, horizontally,
 * vertically or diagonally, storing how many there are in TotalConnected
 * @param Tab - Current Tab
 * @param Player - Current Player
 * @param Length - Length of the board
 * @þaram TotalConnected - number of connected pices
 **/
checkTwoConnected(Tab, Player, Length, TotalConnected):-
	K is Length - 1,
	!,
	checkTwoColumns(Tab, Player, K, Value1),
	checkTwoRows(Tab, Player, K, Value2),
	checkTwoBiggerDiagonals(Tab, Player, K, Value3),
	TotalConnected is Value1 + Value2 + Value3.	


/**
 * isTwoConnected(+Player, +List).
 * Verifies if there are two same pieces connected, by receiving a list of a line (diagonal, horizontal or vertical)
 * @param Player - Current Player
 * @param List - List of a diagonal or row or column from board
 **/
isTwoConnected(Player, List):-
	Piece is Player + 1, 
	sublist([Piece, Piece], List).

/**
 *checkTwoColumns(+Tab, +Player, +Length, -Value).
 * Checks if there are two pieces connected together in a column
 * @param Tab - Current Board
 * @param Player - Current Player
 * @param Length - Board Length 
 * @param Value - 1 if there are any, 0 otherwise
 **/
checkTwoColumns(Tab, Player, Length, Value):-
	between(0, Length, N1), 
	getColumnN(Tab, N1, Col), 
	isTwoConnected(Player, Col),
	Value = 1
	;
	Value = 0.
	

/**
 *checkTwoRows(+Tab, +Player, +Length, -Value).
 * Checks if there are two pieces connected together in a row
 * @param Tab - Current Board
 * @param Player - Current Player
 * @param Length - Board Length 
 * @param Value - 1 if there are any, 0 otherwise
 **/
checkTwoRows(Tab, Player, Length, Value):-
	between(0, Length, N1), 
	nth0(N1, Tab, Row), 
	isTwoConnected(Player, Row),
	Value = 1;
	Value = 0.

/**
 * checkTwoBiggerDiagonals(+Tab, +Player, +Length, -Value).
 * Checks if there are two pieces connected together in any diagonal of the matrix
 * @param Tab - Current Board
 * @param Player - Current Player
 * @param Length - Board Length 
 * @param Value - 1 if there are any, 0 otherwise
 **/
checkTwoBiggerDiagonals(Tab, Player, Length, Value):-
	K is Length - 2,
	between(0, K, Offset), 
	getDiagonal(Tab, D, UpD, SecD, SecUpD, Offset), 
	(
	isTwoConnected(Player, D), Value = 1;
	isTwoConnected(Player, UpD), Value = 1;
	isTwoConnected(Player, SecD), Value = 1;
	isTwoConnected(Player, SecUpD), Value = 1;
	Value = 0
	).
    
/*
			===================================
*/


/**
			===================================
			======== Minimax ALgorithm ========
			===================================
 **/

/**
 * minimax(+Tab, +Player, +State, +Depth, -NextVal, -NextTab). 
 * Applies minimax algorithm to find best next play, returning the best board and respective value
 * @param Tab - Current Board
 * @param Player - Player that is gonna perform initial play 
 * @param State - Current State of the game, player to play, inside minimax 
 * @param Depth - Amount of levels for minimax
 * @param NextVal - Best value from taking a move (NextTab value)
 * @param NextTab - Best valued board from taking a move 
 **/
minimax(Tab, Player, State, Depth, NextVal, NextTab):-

	Depth > 0, 
	NewDepth is Depth - 1,
	valid_moves(Tab, Player, MovesList), 
	best(Tab, Player, State, MovesList, NewDepth, NextTab, NextVal), !
	;
	length(Tab, Length), 
	value(Tab, Player, NextVal, Length), 
	NextTab = Tab.


/**
 * best(+Tab, +Player, +State,+[Move], +Depth, -BestVal, -BestTab). 
 * Base case for best function, applies the last possible move.
 * @param Tab - Current Board
 * @param Player - Player that is gonna perform initial play 
 * @param State - Current State of the game, player to play, inside minimax 
 * @param Move - Next possible move to apply to Tab
 * @param Depth - Amount of levels for minimax
 * @param BestTab - Best valued board from taking the move 
 * @param BestVal - Best value from taking the move (NextTab value)
 **/
best(Tab, Player, State, [Move], Depth, BestTab, BestVal):- 

	Move = [Row, Col, Dir], 
	Piece is Player + 1, 

	move([Row, Col, Dir], Piece, Tab, OutTab),

	nextTurn(Player, State, NextPlayer, NextState),

	minimax(OutTab, NextPlayer, NextState, Depth, BestVal, BestTab), !.

/**
 * best(+Tab, +Player, +State,+[Move|NextMoves], +Depth, -BestVal, -BestTab). 
 * Iterates over all the possible moves from a specific state and board, returning the highest value one
 * @param Tab - Current Board
 * @param Player - Player that is gonna perform initial play 
 * @param State - Current State of the game, player to play, inside minimax 
 * @param [Move|NextMoves] - List of all possible moves to apply to Tab in current State
 * @param Depth - Amount of levels for minimax
 * @param BestTab - Best valued board from taking the move 
 * @param BestVal - Best value from taking the move (NextTab value)
 **/
best(Tab, Player, State, [Move | NextMoves], Depth, BestTab, BestVal):-

	Move = [Row, Col, Dir], 
	Piece is Player + 1, 

	move([Row, Col, Dir], Piece, Tab, OutTab),

	nextTurn(Player, State, NextPlayer, NextState),

	minimax(OutTab, NextPlayer, NextState, Depth, Val1, _), 

	best(Tab, Player, State, NextMoves, Depth, Tab2, Val2), 

	betterOf(OutTab, Val1, Tab2, Val2, BestTab, BestVal, State).



/**
 * betterOf(+Tab1, +Val1, +_, +Val2, -Tab1, -Val1, +State). 
 * Checks if Tab1 is better valued than Tab2,if so returns Tab1 and respective value as best action
 * @param Tab1 - Board option 1
 * @param Val1 - Value from option 1
 * @param Val2 - Value from option 2
 * @param Tab1 - Best Board, in this case, Tab1
 * @param Val1 - Value from best board, Tab1
 * @param State - Player to move
 **/
betterOf(Tab1, Val1, _, Val2, Tab1, Val1, State) :-   
    State = 0,                         
    Val1 < Val2, !                             
    ;
    State = 1,                         
    Val1 > Val2, !.                            


/**
 * betterOf(+_, +_, Tab2, +Val2, -Tab1, -Val1, +State). 
 * If the other call of betterOf fails, it's Tab2 the best play, so this assigns Tab2 as the best action to take
 * @param Tab2 - Board option 2
 * @param Val2 - Value from option 2
 * @param Tab2 - Best Board, in this case, Tab2
 * @param Val2 - Value from best board, Tab2
 * @param State - Player to move
 **/
betterOf(_, _, Tab2, Val2, Tab2, Val2, _).      



/**
 * nextTurn(+Player, +State, -NextPlayer, -NextState).
 * Switches turns, updating Player and State
 * @param Tab - Current Board
 * @param Player - Player that played before
 * @param State - Past State
 * @param NextPlayer - Player updated
 * @param NextState - State updated 
 **/
nextTurn(Player, State, NextPlayer, NextState):-
	NPlayer is Player + 1,
	NextPlayer is mod(NPlayer, 2), 
	NState is State + 1, 
	NextState is mod(NState, 2).
  


		