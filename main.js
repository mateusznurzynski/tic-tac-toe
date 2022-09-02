const gameBoard = (function () {
	const gameElement = document.querySelector('.game');
	const tileElements = gameElement.querySelectorAll('.tile');
	const gameBoard = [];
	tileElements.forEach((tile) => {
		gameBoard.push(Tile(tile));
	});
	const lanes = [
		Lane(0, 1, 2),
		Lane(3, 4, 5),
		Lane(6, 7, 8),
		Lane(0, 4, 8),
		Lane(2, 4, 6),
		Lane(0, 3, 6),
		Lane(1, 4, 7),
		Lane(2, 5, 8),
	];

	function Tile(tileElement) {
		return {
			id: tileElement.getAttribute('data-tile-id'),
			content: tileElement.textContent,
		};
	}

	function Lane(first, second, third) {
		return {
			first,
			second,
			third,
		};
	}

	function updateBoard() {
		gameBoard.forEach((tile) => {
			const currentTile = gameElement.querySelector(
				`[data-tile-id='${tile.id}']`
			);
			currentTile.textContent = tile.content;
		});
	}
	updateBoard();

	function checkAvailability(id) {
		if (gameBoard[id].content === '') {
			return true;
		} else {
			return false;
		}
	}

	function getAvailableTiles() {
		const availableTiles = [];
		gameBoard.forEach((tile) => {
			if (tile.content === '') {
				availableTiles.push(tile.id);
			}
		});
		return availableTiles;
	}

	function changeTile(id, newContent) {
		const available = checkAvailability(id);
		if (!available) {
			return;
		}
		gameBoard[id].content = newContent;
		updateBoard();
	}

	function getWinningLanes() {
		const winningLanes = [];
		lanes.forEach((lane) => {
			if (
				gameBoard[lane.first].content &&
				gameBoard[lane.second].content &&
				gameBoard[lane.third].content
			) {
				if (
					gameBoard[lane.first].content ===
						gameBoard[lane.second].content &&
					gameBoard[lane.second].content ===
						gameBoard[lane.third].content
				) {
					winningLanes.push({
						lane,
						symbol: gameBoard[lane.first].content,
					});
				}
			}
		});
		return winningLanes;
	}

	function getWinnableLanes(symbol) {
		const winnableLanes = [];
		lanes.forEach((lane) => {
			let emptyTiles = 0;
			let correctTiles = 0;
			let emptyTile;
			if (gameBoard[lane.first].content === symbol) {
				correctTiles++;
			} else if (gameBoard[lane.first].content === '') {
				emptyTiles++;
				emptyTile = gameBoard[lane.first].id;
			}
			if (gameBoard[lane.second].content === symbol) {
				correctTiles++;
			} else if (gameBoard[lane.second].content === '') {
				emptyTiles++;
				emptyTile = gameBoard[lane.second].id;
			}
			if (gameBoard[lane.third].content === symbol) {
				correctTiles++;
			} else if (gameBoard[lane.third].content === '') {
				emptyTiles++;
				emptyTile = gameBoard[lane.third].id;
			}

			if (correctTiles === 2 && emptyTiles === 1) {
				winnableLanes.push({ lane, emptyTile });
			}
		});
	}

	function checkForTie() {
		const freeSpace = gameBoard.find((element) => element.content === '');
		if (freeSpace) {
			return false;
		} else {
			return true;
		}
	}

	function resetGameBoard() {
		gameBoard.forEach((tile) => {
			tile.content = '';
		});
		updateBoard();
	}

	return {
		tileElements,
		changeTile,
		getWinningLanes,
		getWinnableLanes,
		checkForTie,
		resetGameBoard,
		getAvailableTiles,
	};
})();

const inputControl = (function () {
	const form = document.querySelector('.game-form');
	const startButton = document.querySelector('.start-btn');
	form.addEventListener('submit', startGame);

	function startGame(e) {
		e.preventDefault();
		document.querySelector('.output').textContent = '';
		const data = new FormData(form);
		const playerName = data.get('player-name');
		const playerSymbol = data.get('player-symbol');
		const difficulty = data.get('difficulty');
		gameFlow.createPlayers(playerName, playerSymbol);
		gameFlow.setDifficulty(difficulty);
		addGameEvents();

		if (gameFlow.checkForComputerTurn()) {
			gameFlow.makeComputerMove();
		}
	}

	function addGameEvents() {
		gameBoard.tileElements.forEach((element) => {
			element.addEventListener('click', handleClick);
		});
		form.removeEventListener('submit', startGame);
		startButton.toggleAttribute('disabled');
		gameBoard.resetGameBoard();
	}

	function handleClick(e) {
		if (gameFlow.checkForComputerTurn()) {
			return;
		}
		const tileId = e.target.getAttribute('data-tile-id');
		gameBoard.changeTile(tileId, gameFlow.getCurrentSymbol());
		gameFlow.changeTurn();
	}

	function removeGameEvents() {
		gameBoard.tileElements.forEach((element) => {
			element.removeEventListener('click', handleClick);
		});
		form.addEventListener('submit', startGame);
		startButton.toggleAttribute('disabled');
	}

	return { addGameEvents, removeGameEvents };
})();

const gameFlow = (function () {
	const DEFAULT_COMPUTER_NAME = 'The computer';
	const DEFAULT_PLAYER_NAME = 'The player';
	const COMPUTER_DELAY = 500; // in ms

	let players;
	let humanSymbol;
	let difficulty;

	function createPlayers(playerUsername, playerSymbol) {
		humanSymbol = playerSymbol;
		const username1 = playerSymbol === 'X' ? playerUsername : null;
		const username2 = playerSymbol === 'O' ? playerUsername : null;
		players = [
			Player('X', username1, true, playerSymbol === 'X' ? false : true),
			Player('O', username2, false, playerSymbol === 'O' ? false : true),
		];
	}

	function setDifficulty(newDifficulty) {
		difficulty = newDifficulty;
	}

	function Player(symbol, username, isHisTurn, computer) {
		if (computer) {
			username = DEFAULT_COMPUTER_NAME;
		}
		if (username === '') {
			username = DEFAULT_PLAYER_NAME;
		}
		return {
			symbol,
			username,
			isHisTurn,
			computer,
		};
	}

	function changeTurn() {
		console.log('turn changed');
		if (checkResult()) {
			return;
		}
		players.forEach((player) => {
			player.isHisTurn = player.isHisTurn === true ? false : true;
		});
		if (checkForComputerTurn()) {
			setTimeout(() => {
				makeComputerMove();
			}, COMPUTER_DELAY);
		}
	}

	function checkForComputerTurn() {
		const currentSymbol = getCurrentSymbol();
		if (currentSymbol !== humanSymbol) {
			return true;
		} else {
			return false;
		}
	}

	function makeComputerMove() {
		const choiceId = getComputerMove();
		gameBoard.changeTile(choiceId, getCurrentSymbol());
		changeTurn();
	}

	function getComputerMove() {
		const availableTiles = gameBoard.getAvailableTiles();

		if (difficulty === 'easy') {
			const numberOfMoves = availableTiles.length;
			const randomMove = Math.floor(Math.random() * numberOfMoves);
			return availableTiles[randomMove];
		} else if (difficulty === 'medium') {
			const winnableLanes = getWinnableLanes(getCurrentSymbol());
			if (winnableLanes.length > 0) {
				return winnableLanes[0].emptyTile;
			}
		}
	}

	function getCurrentSymbol() {
		const currentPlayer = players.find((player) => player.isHisTurn);
		return currentPlayer.symbol;
	}

	function checkResult() {
		const wonLanes = gameBoard.getWinningLanes();
		if (wonLanes.length > 0) {
			declareWinner(wonLanes);
			return true;
		} else {
			const tie = gameBoard.checkForTie();
			if (tie) {
				declareWinner(null);
				return true;
			}
		}
	}

	function declareWinner(lanes) {
		const output = document.querySelector('.output');
		inputControl.removeGameEvents();
		if (!lanes) {
			output.textContent = "It's a tie!";
		} else {
			const winner = players.find(
				(player) => player.symbol === lanes[0].symbol
			);
			output.textContent = `The winner is: ${winner.username}`;
		}
	}

	return {
		changeTurn,
		getCurrentSymbol,
		createPlayers,
		checkForComputerTurn,
		makeComputerMove,
		setDifficulty,
	};
})();
