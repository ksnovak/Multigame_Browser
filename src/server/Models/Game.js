module.exports = class Game {
  constructor({ id, name, viewers, channels }, selected) {
    this.id = Number(id);
    this.name = name;
    if (viewers) this.viewers = viewers;
    if (channels) this.channels = channels;
    if (selected) this.selected = true;
  }

  // Kraken is the older API and has Game objects written out in a different way
  static newGameFromKraken({ game, viewers, channels }) {
    return new Game({
      id: game._id,
      name: game.name,
      viewers,
      channels
    });
  }
};
