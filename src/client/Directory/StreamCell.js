import React, { Component } from "react";
// import './Directory.css';
import "./StreamCell.css";
import PropTypes from "prop-types";

const StreamWidth = 230;
const StreamAspectRatio = 1.75;

const GameWidth = 90;
const GameAspectRatio = 0.75;

export default class StreamCell extends Component {
  componentDidMount() {
    // asdf
  }

  getThumbnail(url, name, width, ratio) {
    return `${url}${name}-${width}x${parseInt(width / ratio, 10)}.jpg`;
  }

  getStreamThumbnail(name) {
    return this.getThumbnail(
      "https://static-cdn.jtvnw.net/previews-ttv/live_user_",
      name,
      StreamWidth,
      StreamAspectRatio
    );
  }

  getGameThumbnail(game) {
    return this.getThumbnail(
      "https://static-cdn.jtvnw.net/ttv-boxart/",
      game,
      GameWidth,
      GameAspectRatio
    );
  }

  render() {
    const { stream, game } = this.props;

    return (
      <div className="streamCell">
        <div className="streamThumbnail">
          <a href={`https://twitch.tv/${stream.name}`}>
            <img
              src={this.getStreamThumbnail(stream.name)}
              alt={`${stream.name}'s thumbnail`}
            />
          </a>
        </div>

        <div className="gameThumbAndLink">
          <a
            href={`https://twitch.tv/directory/game/${game.name}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={this.getGameThumbnail(game.name)}
              className="gameThumbnail"
              alt={game.name}
            />
          </a>
        </div>

        <div className="streamBasicDetails">
          <span className="name">{stream.name}</span>
          <br />
          <span className="viewerCount">{stream.viewers} viewers</span>
        </div>

        <span className="streamGame">
          {game ? ` playing ${game.name}` : ""}
        </span>
        <span className="streamTitle">{stream.title}</span>
      </div>
    );
  }
}

StreamCell.propTypes = {
  stream: PropTypes.object.isRequired,
  game: PropTypes.object.isRequired
};
