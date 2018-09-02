import React, { Component } from 'react';
import './app.css';
import queryString from 'query-string';
import axios from 'axios';
import OptionsPane from './OptionsPane/OptionsPane';
import Directory from './Directory/Directory';
import { version } from '../../package.json';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      games: null,
      streams: null,
      include: [],
      exclude: [],
      languages: [],
      includeTop: true,
      generatedTime: null
    };
  }

  componentDidMount() {
    const qs = queryString.parse(window.location.search);

    axios
      .get('/api/combo', {
        params: {
          include_top_games: qs.include_top_games || false,
          game_name: qs.game_name,
          game_id: qs.game_id,
          stream_name: qs.stream_name,
          stream_id: qs.stream_id,
          language: qs.language
        }
      })
      .then((res) => {
        this.setState({
          games: res.data.games,
          streams: res.data.streams,
          generatedTime: res.headers.date
        });
      });
  }

  handleChange(event) {
    const { id } = event.target;

    console.log(`Change in ${id}`);

    switch (id) {
      case 'englishOnly':
        this.setState({ languages: event.target.checked ? ['en'] : [] });
        break;

      case 'includeTop':
        this.setState({ includeTop: event.target.checked });
        break;

      case 'gameList':
        break;
      case 'includeGames':
        break;
      case 'includeList':
        break;
      case 'excludeList':
        break;
      default:
        console.log(`Fell to default with ${id}`);
        break;
    }
  }

  render() {
    const { streams, games, include, exclude, languages, includeTop, generatedTime } = this.state;
    return (
      <div id="home" className="row" onChange={this.handleChange.bind(this)}>
        <OptionsPane
          games={games}
          include={include}
          exclude={exclude}
          languages={languages}
          includeTop={includeTop}
          generatedTime={generatedTime}
          version={version}
        />

        <Directory streams={streams} games={games} />
      </div>
    );
  }
}
