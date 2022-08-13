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

	function changeTile(id, newContent) {
		const available = checkAvailability(id);
		if (!available) {
			return;
		}
		gameBoard[id].content = newContent;
		updateBoard();
	}

	function checkLanes() {
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
		checkLanes,
		checkForTie,
		resetGameBoard,
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
		gameFlow.createPlayers(playerName, playerSymbol);
		addGameEvents();
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
	let players;
	const COMPUTER_NAME = 'Computer';

	function createPlayers(playerUsername, playerSymbol) {
		const username1 = playerSymbol === 'X' ? playerUsername : null;
		const username2 = playerSymbol === 'O' ? playerUsername : null;
		players = [Player('X', username1, true), Player('O', username2, false)];
	}

	function Player(symbol, username, isHisTurn, computer) {
		if (computer) {
			username = COMPUTER_NAME;
		}
		return {
			symbol,
			username,
			isHisTurn,
			computer,
		};
	}

	function changeTurn() {
		checkResult();
		players.forEach((player) => {
			player.isHisTurn = player.isHisTurn === true ? false : true;
		});
	}

	function getCurrentSymbol() {
		const currentPlayer = players.find((player) => player.isHisTurn);
		return currentPlayer.symbol;
	}

	function checkResult() {
		const wonLanes = gameBoard.checkLanes();
		if (wonLanes.length > 0) {
			declareWinner(wonLanes);
		} else {
			const tie = gameBoard.checkForTie();
			if (tie) {
				declareWinner(null);
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

	return { changeTurn, getCurrentSymbol, createPlayers };
})();
