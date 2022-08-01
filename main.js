const gameBoard = (function () {
	const gameElement = document.querySelector('.game');
	const tileElements = gameElement.querySelectorAll('.tile');
	const gameBoard = [];
	tileElements.forEach((tile) => {
		gameBoard.push(Tile(tile));
	});

	function Tile(tileElement) {
		return {
			id: tileElement.getAttribute('id'),
			content: tileElement.textContent,
		};
	}

	function updateBoard() {
		gameBoard.forEach((tile) => {
			const currentTile = gameElement.querySelector(`#${tile.id}`);
			currentTile.textContent = tile.content;
		});
	}
	updateBoard();
})();
