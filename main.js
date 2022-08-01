const gameBoard = (function () {
	const gameElement = document.querySelector('.game');
	const tileElements = gameElement.querySelectorAll('.tile');
	const gameBoard = [];
	tileElements.forEach((tile) => {
		gameBoard.push(Tile(tile));
	});

	function Tile(tileElement) {
		return {
			id: tileElement.getAttribute('data-tile-id'),
			content: tileElement.textContent,
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

	return { tileElements, changeTile };
})();

const inputControl = (function () {
	gameBoard.tileElements.forEach((element) => {
		element.addEventListener('click', handleClick);
	});

	function handleClick(e) {
		const tileId = e.target.getAttribute('data-tile-id');
		gameBoard.changeTile(tileId, 'X');
	}
})();
