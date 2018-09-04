import React, { Component } from 'react';
import './app.css';
import queryString from 'query-string';
import axios from 'axios';
import OptionsPane from './OptionsPane/OptionsPane';
import Directory from './Directory/Directory';
import NoStreams from './Directory/NoStreams';
import { version } from '../../package.json';

function getArray(value) {
  if (value == null || value == undefined) {
    return [];
  }
  if (Array.isArray(value)) {
    return value;
  }

  return [value];
}

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      games: null,
      streams: null,
      includeGames: [],
      include: [],
      exclude: [],
      language: [],
      includeTop: true,
      generatedTime: null
    };
  }

  // Update the inclusion/exclusion arrays whenever their Select is changed
  handleListChange = (key, array) => {
    // doing [key] will find the element of that string value, since it could be 'include', 'exclude', or 'includeGames'
    this.setState({ [key]: array.map(obj => obj.label) });
  };

  handleSubmit = event => {
    const details = {
      include_top_games: this.state.includeTop,
      game_name: this.state.includeGames,
      stream_name: this.state.include,
      language: this.state.language
    };

    this.getStreams(details);

    const newParams = '?' + queryString.stringify(details);
    this.pushNewState(newParams);

    if (event) event.preventDefault();
  };

  handleHomeClick = event => {
    this.setState(
      {
        includeGames: [],
        include: [],
        language: []
      },
      () => {
        this.handleSubmit();
      }
    );
  };

  //
  handleFavoritesClick = event => {
    this.setState(
      {
        includeTop: false,
        includeGames: [
          'Cities: Skylines',
          'Stardew Valley',
          'Guild Wars 2',
          'Into the Breach',
          'RimWorld',
          'Terraria',
          'Dungeon of the Endless',
          'Slay the Spire',
          'Dead Cells'
        ],
        include: [
          'aphromoo',
          'lethalfrag',
          'scarra',
          'meteos',
          'day9tv',
          'dismaid',
          'scarizardplays',
          'kitboga',
          'albinoliger',
          'cilantrogamer'
        ],
        language: ['en']
      },
      () => {
        this.handleSubmit();
      }
    );
  };

  getStreams(params) {
    axios
      .get('/api/combo', {
        params
      })
      .then(res => {
        this.setState({
          games: res.data.games,
          streams: res.data.streams,
          generatedTime: res.headers.date
        });
      });
  }

  pushNewState(newUrl) {
    if (history.pushState) window.history.pushState({ path: newUrl }, '', newUrl);
    else window.location.href = newUrl;
  }

  componentDidMount() {
    const qs = queryString.parse(window.location.search);

    this.setState({
      includeTop: qs.include_top_games === 'true',
      language: getArray(qs.language).sort(),
      include: getArray(qs.stream_name).sort(),
      exclude: getArray(qs.exclude_stream_name).sort()
    });

    this.getStreams({
      include_top_games: this.state.includeTop,
      game_name: qs.game_name,
      game_id: qs.game_id,
      stream_name: qs.stream_name,
      stream_id: qs.stream_id,
      language: this.state.language
    });
  }

  handleChange = event => {
    const { id } = event.target;

    console.log(`Change in ${id}`);

    switch (id) {
      case 'englishOnly':
        this.setState({ language: event.target.checked ? ['en'] : [] });
        break;

      case 'includeTop':
        this.setState({ includeTop: event.target.checked });
        break;

      case 'gamesList':
        break;
      case 'includeGames':
        break;
      case 'includeList':
        break;
      case 'excludeList':
        break;
      default:
        // console.log(`Fell to default with ${id}`);
        break;
    }
  };

  render() {
    const { streams, games, include, exclude, language, includeTop, generatedTime } = this.state;

    return (
      <div id="home" className="row" onChange={this.handleChange}>
        <OptionsPane
          games={games}
          streams={streams}
          include={include}
          exclude={exclude}
          language={language}
          includeTop={includeTop}
          generatedTime={generatedTime}
          version={version}
          handleListChange={this.handleListChange}
          handleSubmit={this.handleSubmit}
          handleFavoritesClick={this.handleFavoritesClick}
          handleHomeClick={this.handleHomeClick}
        />
        {streams && streams.length ? <Directory streams={streams} games={games} /> : <NoStreams />}
      </div>
    );
  }
}
