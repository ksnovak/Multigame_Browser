import React, { Component } from 'react';
import './Directory.css';
import PropTypes from 'prop-types';
import StreamCell from './StreamCell';

export default class Directory extends Component {
  componentDidMount() {}

  render() {
    const { streams, games } = this.props;

    const gameIDs = games.map(game => game.id);

    const streamCells = streams.map((stream) => {
      const correctGameIndex = gameIDs.indexOf(stream.game_id);
      const game = correctGameIndex > -1 ? games[correctGameIndex] : null;

      return <StreamCell key={stream.user_id} stream={stream} game={game} />;
    });

    return <div className="directory col-sm-10 col-lg-9 row">{streamCells || 'Still loading'}</div>;
  }
}

Directory.propTypes = {
  games: PropTypes.arrayOf(PropTypes.object),
  streams: PropTypes.arrayOf(PropTypes.object)
};

Directory.defaultProps = {
  games: null,
  streams: null
};
