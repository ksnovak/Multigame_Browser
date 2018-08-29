import React, { Component } from 'react';
import './Directory.css';
import StreamCell from './StreamCell'

export default class Directory extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() { }

  render() {
    const { streams, games } = this.props;

    if (streams && streams.length && games && games.length) {
      let gameIDs = games.map(game => game.id)

      let streamCells = streams.map(stream => {
        let correctGameIndex = gameIDs.indexOf(stream.game_id);
        let game = (correctGameIndex > -1) ? games[correctGameIndex] : null


        return <StreamCell stream={stream} game={game} />
      })

      return (
        <div className="directory col-sm-10 col-lg-9 row">
          {streamCells}
        </div>
      );
    }
    else {
      return (

        <div className="directory col-sm-10 col-lg-9">
          Still Loadening
        </div>
      )
    }
  }
}
