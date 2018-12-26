
/**
getCoordFromInt(-X).
Reads a numerical coordinate from the user input.
@param X - the output numerical coordinate
**/
getCoordFromInt(X):-
	get_code(Temp),
	X is Temp - 48.


/**
getCoordFromAscii(-X).
Read and converts an alphabetic coordinate from the user input to a numerical coordinate. 
A = 1, B = 2, and so on.
@param X - the output numerical coordinate
**/
getCoordFromAscii(X):-
	get_code(Temp),
	X is Temp - 97.

/**
askUserInput(-X, -Y, +N).
Asks for User Input coordinates. 
Translates visual coordinates into the internal ones used in the list.
@param Row - the row
@param Col - the column
@param N - the board length
**/
askUserInput(Row, Col, N):-
    write(' Insert the piece coordinates(e.g. \'4b.\'): '),
	getCoordFromInt(Temp),
	Row is N - Temp,
	getCoordFromAscii(Col), 
	skip_line.

/**
 * askUserMove(-X)
 * Asks for User Input Move.
 * The Move is an integer from 1 to 9, excluding 5. 
 * @param X - the Move
 **/
askUserMove(X):-
	write(' Insert the move direction: '), 
	catch(read(X), _, fail),
	get_code(_).

/**
 * waitForKeyPress
 * Interrupts the program until the user presses enter
 **/
waitForKeyPress:-
	get_code(_).
