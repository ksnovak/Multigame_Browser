module.exports = class Game {
	constructor (game) {
		if (game) {
			this.id = Number(game.id);
			this.name = game.name;
			this.box_art = game.box_art_url;
			this.viewers = game.viewers;
			this.channels = game.channels;
		}
	}

	//Kraken is older API, but gives more details
	static newGameFromKraken(krakenDetail) {
		let newGame = new Game();
		newGame.id = krakenDetail.game._id;
		newGame.name = krakenDetail.game.name;
		newGame.box_art = krakenDetail.game.box.medium;
		newGame.viewers = krakenDetail.viewers;
		newGame.channels = krakenDetail.channels;

		return newGame;
	}
}