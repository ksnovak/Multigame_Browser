import React, { Component } from 'react';
import './Directory.css';
import PropTypes from 'prop-types';
import StreamCell from './StreamCell';
import BottomLinks from './BottomLinks';
import NoStreams from './NoStreams';
import LoadMore from './LoadMore';
import Loading from './Loading';

export default class Directory extends Component {
  componentDidMount() {}

  render() {
    const { streams, games, loading, handleLoadMore, pagination } = this.props;

    const gameIDs = games.map(game => game.id);

    const streamCells = streams.map((stream) => {
      const correctGameIndex = gameIDs.indexOf(stream.game_id);
      const game = correctGameIndex > -1 ? games[correctGameIndex] : null;

      return <StreamCell key={stream.name} stream={stream} game={game} />;
    });

    return (
      <div className="col-sm-10 col-lg-9">
        <Loading isLoading={loading} />
        {streamCells.length ? <div className="directory">{streamCells}</div> : <NoStreams />}
        <br />
        <LoadMore handleClick={handleLoadMore} disabled={!pagination} />
        <BottomLinks />
      </div>
    );
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
