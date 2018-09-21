import React, { Component } from 'react';
import './app.css';
import queryString from 'query-string';
import axios from 'axios';
import OptionsPane from './OptionsPane/OptionsPane';
import Directory from './Directory/Directory';
import { version } from '../../package.json';

function getArray(value) {
  if (value == null || value == undefined) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.sort();
  }

  return [value];
}

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      games: [],
      streams: [],
      includeGames: [],
      include: [],
      exclude: [],
      language: [],
      includeTop: true,
      generatedTime: null,
      loading: false
    };
  }

  // Update the inclusion/exclusion arrays whenever their Select is changed
  handleListChange = (key, array) => {
    // doing [key] will find the element of that string value, since it could be 'include', 'exclude', or 'includeGames'
    this.setState({ [key]: array.map(obj => obj.label) });
  };

  handleToggle = (name, newValue) => {
    if (name === 'includeTop') {
      this.setState({ includeTop: newValue });
    } else if (name === 'language') {
      this.setState({ language: newValue ? ['en'] : [] });
    }
  };

  // Submitting the form: Get the new games & streams, and update the querystring
  handleSubmit = event => {
    //Grab the important details from the state
    const details = {
      include_top: this.state.includeTop,
      game: this.state.includeGames,
      name: this.state.include,
      exclude: this.state.exclude,
      language: this.state.language
    };

    // Call the API to get the new games & streams
    this.getStreams(details);

    // Update the querystring. Sorting just so that the less-spammy params get listed first
    const order = ['include_top', 'language', 'name', 'exclude', 'game'];
    const newParams =
      '?' +
      queryString.stringify(details, {
        sort: (left, right) => order.indexOf(left) >= order.indexOf(right)
      });

    this.pushNewState(newParams);

    if (event) event.preventDefault();
  };

  handleHomeClick = event => {
    this.setState(
      {
        includeGames: [],
        include: [],
        language: [],
        includeTop: undefined
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
    this.setState({ loading: true });
    axios
      .get('/api/combo', {
        params
      })
      .then(res => {
        this.setState({
          games: res.data.games,
          includeGames: res.data.games.filter(game => game.selected).map(game => game.name),
          streams: res.data.streams,
          generatedTime: res.headers.date,
          loading: false
        });
      });
  }

  pushNewState(newUrl) {
    if (history.pushState) window.history.pushState({ path: newUrl }, '', newUrl);
    else window.location.href = newUrl;
  }

  componentDidMount() {
    const qs = queryString.parse(window.location.search);

    //Set the state based on querystring values as appropriate
    this.setState(
      {
        includeTop: qs.include_top !== 'false',
        language: getArray(qs.language),
        include: getArray(qs.name),
        exclude: getArray(qs.exclude),
        includeGames: getArray(qs.game)
      },
      () => {
        //After the state values are set, make our initial query.
        this.getStreams({
          include_top: this.state.includeTop,
          game: this.state.includeGames,
          name: this.state.include,
          language: this.state.language,

          //These two aren't stored in State. Not sure if they should be, since they're only used for passing to the server.
          game_id: qs.game_id,
          stream_id: qs.stream_id
        });
      }
    );
  }

  render() {
    const {
      streams,
      games,
      includeGames,
      include,
      exclude,
      language,
      includeTop,
      generatedTime,
      loading
    } = this.state;

    return (
      <div id="home" className="row">
        <OptionsPane
          games={games}
          includeGames={includeGames}
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
          handleToggle={this.handleToggle}
          loading={loading}
        />

        <Directory streams={streams} games={games} loading={loading} />
      </div>
    );
  }
}
