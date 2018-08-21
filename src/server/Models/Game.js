module.exports = class Game {
  constructor(game) {
    this.id = Number(game.id);
    this.name = game.name;
    this.box_art = game.box_art_url;
    if (game.viewers) this.viewers = game.viewers;
    if (game.channels) this.channels = game.channels;
  }

  // Kraken is the older API and has Game objects written out in a different way
  static newGameFromKraken(krakenDetail) {
    return new Game({
      id: krakenDetail.game._id,
      name: krakenDetail.game.name,
      box_art: krakenDetail.game.box.medium,
      viewers: krakenDetail.viewers,
      channels: krakenDetail.channels
    });
  }
};
