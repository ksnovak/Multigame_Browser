import React, { Component } from 'react';
import './Directory.css';
import PropTypes from 'prop-types';

export default class StreamCell extends Component {
  componentDidMount() {
    // asdf
  }

  getThumbnail(url, width, ratio) {
    return url.replace('{width}', width).replace('{height}', parseInt(width / ratio));
  }

  render() {
    const { stream, game } = this.props;

    const StreamWidth = 230;
    const StreamAspectRatio = 1.75;

    const GameWidth = 90;
    const GameAspectRatio = 0.75;

    return (
      <div id="streamCell" className="col-sm-2 py-1 px-1">
        <div className="row py-1 px-1">
          <a className="streamThumbnail" href={`https://twitch.tv/${stream.login}`}>
            <img
              src={this.getThumbnail(stream.thumbnail_url, StreamWidth, StreamAspectRatio)}
              alt={`${stream.login}'s thumbnail`}
            />
          </a>
        </div>
        <div className="row px-1">
          <div className="col-sm-2 px-0">
            <a
              href={`https://twitch.tv/directory/game/${game.name}`}
              target="_blank"
              rel="noopener"
            >
              <img
                src={this.getThumbnail(game.box_art, GameWidth, GameAspectRatio)}
                className="gameThumbnail"
                alt={game.name}
              />
            </a>
          </div>
          <div className="col-sm-10">
            <span className="login">{stream.login}</span> with{' '}
            <span className="viewerCount">{stream.viewer_count} viewers</span>
            <span className="streamGame">{game ? `playing ${game.name}` : ''}</span>
          </div>
          <span className="streamTitle">{stream.title}</span>
        </div>
      </div>
    );
  }
}

StreamCell.propTypes = {
  stream: PropTypes.object.isRequired,
  game: PropTypes.object.isRequired
};
