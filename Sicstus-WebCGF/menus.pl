printMainMenu:-
    write('***********************'), nl,
    write('*     -Neutreeko-     *'), nl , 
    write('***********************'), nl,
    write('*   Choose an option  *'), nl, 
    write('*       1-Play        *'), nl,
    write('*       2-Rules       *'), nl,
    write('*       3-Exit        *'), nl,
    write('***********************'), nl.

mainMenu:-
    cls,
    printMainMenu, 
    retractall(map(_, _)),
    repeat,
    catch(read(X), _, fail),
    discard_new_line,
     nl,
    (
        X = 1, !, playMenu;
        X = 2, !, rulesMenu, mainMenu; 
        X = 3, true;
        invalid
    ).


printGamePlayMenu:-
        write('***********************'), nl,
        write('*     -Neutreeko-     *'), nl , 
        write('***********************'), nl,
        write('*   Choose an option  *'), nl, 
        write('*   1-Human vs Human  *'), nl,
        write('*    2-Human vs Bot   *'), nl,
        write('*     3-Bot vs Bot    *'), nl,
        write('*       4-Back        *'), nl,
        write('***********************'), nl.



playMenu:-
    cls,
    printGamePlayMenu, 
    repeat,
    catch(read(X), _, fail),
    discard_new_line,
    nl, 
    (

        X = 1, !, startPvPGame; 
        X = 2, !, botMenu(2); 
        X = 3, !, botChoice;
        X = 4, !, mainMenu;
        invalid
    ).




printBotMenu:-
    write('***********************'), nl,
    write('*     -Neutreeko-     *'), nl , 
    write('***********************'), nl,
    write('*   Choose an option  *'), nl, 
    write('*     1-Random Bot    *'), nl,
    write('*     2-Greedy Bot    *'), nl,
    write('*    3-Mini-Max Bot   *'), nl,
    write('*        4-Back       *'), nl,
    write('***********************'), nl.


askBotChoice(Order, Level):-
    repeat,
    write(' Enter the level of the '), write(Order), write( ' bot to play: '),
    catch(read(Level), _, fail),
    discard_new_line,
    !,
    Level \= 4.
    
botChoice:-
    cls,
    printBotMenu,
    (
    askBotChoice('first', Level1),
    nl, 
    askBotChoice('second', Level2),
    startBvBGame(Level1, Level2)
    ;
    mainMenu
    ).



botMenu(Mode):-
    cls,
    printBotMenu, 
    repeat,
    catch(read(X), _, fail),
    discard_new_line,
    nl, 
    (
        Mode = 2, 
        (
            X = 4, !, playMenu; 
            pickFirstPlayer(First),
            (
                X = 1, !, startPvBGame(X, First);
                X = 2, !, startPvBGame(X, First); 
                X = 3, !, startPvBGame(X, First)
            )
        )
        ;
        Mode = 3,
        (
                X = 1, !, startBvBGame(X);
                X = 2, !, startBvBGame(X); 
                X = 3, !, startBvBGame(X);
                X = 4, !, playMenu
        );
        invalid
    ).


pickFirstPlayer(X):-
    cls,
    printFirstPlayerMenu,
    repeat,
    catch(read(Temp), _, fail), 
    integer(Temp),
    discard_new_line,
    X is Temp - 1, 
    between(1, 2, Temp).


printFirstPlayerMenu:-
        write('***********************'), nl,
        write('*     -Neutreeko-     *'), nl , 
        write('***********************'), nl,
        write('*   Choose an option  *'), nl, 
        write('*      1-Bot First    *'), nl,
        write('*     2-Human First   *'), nl,
        write('***********************'), nl.

discard_new_line:-
    get_code(_).

invalid:-
    write('Invalid Choice! Press Enter to try again'), nl, waitForKeyPress, fail.

rulesMenu:-
    cls,
    printRulesMenu, 
    nl, 
    write('Press Enter to go back!'), nl, 
    waitForKeyPress.




printRulesMenu:-
    write('***********************************************************************'), nl,
    write('*                             -Neutreeko-                             *'), nl , 
    write('***********************************************************************'), nl,
    write('*                                                                     *'),nl,
    write('*       1-  A piece slides orthogonally or diagonally until           *'), nl,
    write('*     stopped by an occupied square or the border of the board.       *'), nl,
    write('*                                                                     *'),nl,
    write('*         2- Movement follows the direction of the NumPad             *'), nl,
    write('*              E.g, 7 means to go up and to the left                  *'), nl,
    write('*                                                                     *'),nl,
    write('*                3- Squares always move first                         *'),nl,
    write('*                                                                     *'),nl,
    write('*   To win you must get three in a row, orthogonally or diagonally.   *'), nl,
    write('*                      The row must be connected.                     *'), nl,
    write('*                                                                     *'),nl,
    write('* A match is declared a draw if the same position occurs three times. *'), nl, 
    write('*                                                                     *'),nl,
    write('***********************************************************************'), nl.