module.exports = class Game {
	constructor (game) {
		if (game) {
			this.id = Number(game.id);
			this.name = game.name;
			this.box_art = game.box_art_url
			this.viewers = game.viewers;
			this.channels = game.channels;
		}
		else {
			this.id = 0;
			this.name = '';
			this.box_art = '';
			this.viewers = 0;
			this.channels = 0;
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