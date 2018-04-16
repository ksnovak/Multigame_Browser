module.exports = class Game {
	constructor (game) {
		this.id = Number(game.id);
		this.name = game.name;
		this.box_art_url = game.box_art_url
		this.viewers = game.viewers;
		this.channels = game.channels;
	}
}