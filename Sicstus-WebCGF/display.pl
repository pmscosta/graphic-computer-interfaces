:- use_module(library(lists)).

% 0 is translated to a space
translate(0, 0x2003).

% 1 is translated to a circle (unicode)
translate(1, 0xFFEE).

% 2 is translated to a square (unicode)
translate(2, 0xFFED).

/**
 * div_line_bold
 * Draws a straight bold line like ━━━
 */
div_line_bold:-
	put_code(0x2501),
	put_code(0x2501),
	put_code(0x2501).

/**
 * div_line
 * Draws a straight bold line like ───
 */
div_line:-
	put_code(0x2500),
	put_code(0x2500),
	put_code(0x2500).

/**
 * write_ident(+A)
 * Outputs the atom A and adds a space after it.
 * Useful when outputting the coordiantes in the left side of the board
 *  to separate it a bit from it.
 */
write_ident(A):-
	write(A),
	write(' ').

print_tab([]).

/**
 * print_tab(+Board,)
 * 
 */
print_tab([L|T], 1):-
	write_ident(1),	
	print_line(L),
	print_tab(T).


/**
 * print_tab(+Board, +N)
 * 
 * Starts the board drawing, with the line coordinates
 * @param Board
 * @param N - the number of lines
 * */
print_tab([L|T], N):-
	write_ident(N),      %writing the coordinates
	print_line(L),        %writing one line
	N > 0,
	print_hor_div(L),     %writing a small divisor between the the lines ├
	N1 is N - 1,
	print_tab(T, N1).    %iterating all lines

/**
 * print_hor_div(+Line)
 * 
 * Outputs ├ 
 * 
 * @param Line - the current line
 * 
 */
print_hor_div(L):-
	write('  '),
	put_code(0x251C),
	print_div(L),
	nl.

/**
 * print_div_line(+Separator)
 * 
 * Outputs a single straight line and then a sepator, to better distinguish the several positions in the board
 * 
 * @param Separator
 */
print_div_line(C):-
	div_line,
	put_code(C).

print_div([]).


/**
 * print_div(+Line)
 * 
 * When it is the last element, a different separator must be drawn
 * 
 */
print_div([_|[]]):-
	print_div_line(0x2524), 
	print_div([]).

/**
 * print_div(+Line)
 * Iterates all of the line positions and prints their division
 */
print_div([_|L]):-
	print_div_line(0x253C),  %the code for ┼	
	print_div(L).

/**
 * print_line([])
 * 
 * Prints the end of of line separator 
 * 
 * */
print_line([]):- 
	put_code(0x2502), nl.

/**
 * print_line(+Line)
 * 
 * Iterates a line and draws its elements
 * 
 */
print_line([C|L]):-
	print_cell(C),
	print_line(L).


/**
 * print_cell(+Element)
 * 
 * Draws a single Element from a Line
 * Uses the translate predicate to see what that element code is
 * 
 * */
print_cell(C):-
	translate(C, V),
	put_code(0x2502),
	put_code(0x2003),
	put_code(V),
	put_code(0x2003).

/**
 * top_number(+Board, +Coordinate)
 * 
 * Translates a numerical Coordinate to an Alphabetic one
 * and outputs it below the Board.
 * E.g. Coordinate 0 becomes A, 1 becomes B, ....
 * 
 */
top_number([L|_], N):-
	write('  '),
	A is 0x41,
	print_top_number(L, N, A).

print_top_number(_, 0, _):- nl.

/**
 * print_top_number(+Board, +Coordinate, +AlphaStart)
 * 
 * Auxiliary funtion to top_number
 * 
 * Alpha Start is the correspondence between the coordinate 0 and the first letter.
 * In our case, 0 equals A
 * */
print_top_number([_|L], N, A):-
	write('  '),
	put_code(A),
	write(' '),
	N1 is N - 1, 
	A1 is A + 1, 
	print_top_number([_|L], N1, A1).

/**
 * top_wall(+Board)
 * Draws a bold top line representing the beginning of the Board.
 * @param Board 
 */
top_wall([L|_]):-
	write('  '),
	put_code(0x250F),   %starts by adding a straight corner in the beginning of the top line
	print_top_wall(L).


print_top_wall([]):- nl.

/**
 * print_top_wall(+Board)
 * Draws one section of the top line (each Board element is a section) 
 * 	and adds a small divisor between the parts (┯ or ┓)
 */
print_top_wall([_|L]):-
	div_line_bold,            %printing the line
	print_top_last([_|L]).    %adding the small divisor

/**
 * print_top_last(+Board)
 * Adds the small divisor mentioned in print_top_wall at the end
 * In this case, adds ┓
 */
print_top_last([_|[]]):-
	put_code(0x2513),
	print_top_wall([]).

/**
 * print_top_last(+Board)
 * Adds the small divisor mentioned in print_top_wall in the middle of the sections
 * In this case, in the end of the line adds ┯
 */
print_top_last([_|L]):-
	put_code(0x252F),
	print_top_wall(L).


/**
 * bot_wall(+Board, +N)
 * Similar to top_wall but in the end part of the Board
 * Also adds a row of letters to represent the coordinates
 * @param Board
 * @param N - the number of elements in the row 
 */
bot_wall([L|_], N):-
	write('  '),
	put_code(0x2517),
	print_bot_wall(L),
	top_number([L|_], N).

print_bot_wall([]):- nl.

/**
 * print_bot_wall(+Board)
 * Similar to print_top_wall, but in the end of the Board
 */
print_bot_wall([_|L]):-
	div_line_bold,
	print_bot_last([_|L]).


/**
 * print_bot_last(+Board)
 * Similar to print_top_last, but in the end of the Board
 */
print_bot_last([_|[]]):-
	put_code(0x251B),
	print_bot_wall([]).

/**
 * print_bot_last(+Board)
 * Similar to print_top_last, but in the end of the Board
 */
print_bot_last([_|L]):-
	put_code(0x2537),
	print_bot_wall(L).

/**
 * display_board(+Board)
 * Outputs the board in a user friendly wait to the standard output
 * @param Board - the board to be shown 
 */
display_board(Board):-
	length(Board, N),
	top_wall(Board),
	print_tab(Board, N),
	bot_wall(Board, N).


announcePlayer(Player):-
	Piece is Player + 1,
	translate(Piece, Code),
	write('Player: '), 
	put_code(Code),
	nl.

cls :- write('\e[H\e[2J').