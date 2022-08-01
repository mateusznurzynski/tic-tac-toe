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
			console.log('Not Available');
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

	return { tileElements, changeTile, checkLanes, checkForTie };
})();

const inputControl = (function () {
	gameBoard.tileElements.forEach((element) => {
		element.addEventListener('click', handleClick);
	});

	function handleClick(e) {
		const tileId = e.target.getAttribute('data-tile-id');
		gameBoard.changeTile(tileId, gameFlow.getCurrentSymbol());
		gameFlow.changeTurn();
	}
})();

const gameFlow = (function () {
	const players = [Player('X', 1, true), Player('O', 2, false)];
	function Player(symbol, id, isHisTurn) {
		return {
			symbol,
			id,
			isHisTurn,
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
			console.log(wonLanes);
		} else {
			const tie = gameBoard.checkForTie();
			if (tie) {
				console.log('tie');
			}
		}
	}

	return { changeTurn, getCurrentSymbol };
})();
