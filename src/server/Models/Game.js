module.exports = class Game {
  constructor({
    id, name, box_art_url, viewers, channels
  }) {
    this.id = Number(id);
    this.name = name;
    this.box_art = box_art_url;
    if (viewers) this.viewers = viewers;
    if (channels) this.channels = channels;
  }

  // Kraken is the older API and has Game objects written out in a different way
  static newGameFromKraken({ game, viewers, channels }) {
    return new Game({
      id: game._id,
      name: game.name,
      box_art: game.box.medium,
      viewers,
      channels
    });
  }
};
