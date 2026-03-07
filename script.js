document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('.cell');
    const statusElement = document.getElementById('gameStatus');
    const resetBtn = document.getElementById('resetBtn');

    let board = ['', '', '', '', '', '', '', '', ''];
    let gameActive = true;

    // Human is X, AI is O
    const HUMAN = 'X';
    const AI = 'O';

    const WINNING_COMBINATIONS = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });

    resetBtn.addEventListener('click', resetGame);

    function handleCellClick(e) {
        const index = e.target.getAttribute('data-index');

        if (board[index] !== '' || !gameActive) return;

        // Human Turn
        makeMove(index, HUMAN);

        if (checkWin(board, HUMAN)) {
            endGame(HUMAN);
            return;
        }

        if (checkTie(board)) {
            endGame('TIE');
            return;
        }

        // AI Turn
        gameActive = false;
        statusElement.textContent = "AI is thinking...";

        setTimeout(() => {
            // Moderate Difficulty: 50% chance optimal (Minimax), 50% chance random valid move
            const playOptimally = Math.random() < 0.5;
            let bestMoveIndex;

            if (playOptimally) {
                bestMoveIndex = minimax(board, AI).index;
            } else {
                const availableSpots = getEmptySpots(board);
                const randomIdx = Math.floor(Math.random() * availableSpots.length);
                bestMoveIndex = availableSpots[randomIdx];
            }

            makeMove(bestMoveIndex, AI);

            if (checkWin(board, AI)) {
                endGame(AI);
                return;
            }

            if (checkTie(board)) {
                endGame('TIE');
                return;
            }

            gameActive = true;
            statusElement.textContent = `Your turn: Play as ${HUMAN}`;
        }, 500); // 500ms delay for realism
    }

    function makeMove(index, player) {
        board[index] = player;
        cells[index].textContent = player;
        cells[index].classList.add(player.toLowerCase());
    }

    function getEmptySpots(boardState) {
        return boardState.map((val, idx) => val === '' ? idx : null).filter(val => val !== null);
    }

    function checkWin(boardState, player) {
        for (let combo of WINNING_COMBINATIONS) {
            if (boardState[combo[0]] == player &&
                boardState[combo[1]] == player &&
                boardState[combo[2]] == player) {
                return combo;
            }
        }
        return null;
    }

    function checkTie(boardState) {
        return getEmptySpots(boardState).length === 0;
    }

    function endGame(winner) {
        gameActive = false;
        if (winner === 'TIE') {
            statusElement.textContent = "It's a Tie!";
            statusElement.style.color = 'var(--text-primary)';
        } else {
            statusElement.textContent = winner === HUMAN ? "You Win!" : "AI Wins!";
            statusElement.style.color = winner === HUMAN ? 'var(--x-color)' : 'var(--o-color)';

            const winningCombo = checkWin(board, winner);
            if (winningCombo) {
                winningCombo.forEach(index => {
                    cells[index].classList.add('win');
                });
            }
        }
    }

    function resetGame() {
        board = ['', '', '', '', '', '', '', '', ''];
        gameActive = true;
        statusElement.textContent = `Your turn: Play as ${HUMAN}`;
        statusElement.style.color = 'var(--text-primary)';

        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o', 'win');
        });
    }

    // --- Minimax Algorithm ---
    function minimax(newBoard, player) {
        let availSpots = getEmptySpots(newBoard);

        // Define terminal states and return heuristic value
        if (checkWin(newBoard, HUMAN)) {
            return { score: -10 };
        } else if (checkWin(newBoard, AI)) {
            return { score: 10 };
        } else if (availSpots.length === 0) {
            return { score: 0 };
        }

        let moves = [];

        for (let i = 0; i < availSpots.length; i++) {
            let move = {};
            move.index = availSpots[i];

            // Try out the board state
            newBoard[availSpots[i]] = player;

            if (player == AI) {
                let result = minimax(newBoard, HUMAN);
                move.score = result.score;
            } else {
                let result = minimax(newBoard, AI);
                move.score = result.score;
            }

            // Undo the move for next iteration
            newBoard[availSpots[i]] = '';
            moves.push(move);
        }

        // Choose the best move based on the player
        let bestMove;
        if (player === AI) {
            let bestScore = -Infinity;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score > bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score < bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        }

        return moves[bestMove];
    }
});
