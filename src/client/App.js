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
      loading: false,
      page: 0
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
      language: this.state.language,
      streams_after: this.state.pagination
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
        exclude: [],
        language: [],
        includeTop: undefined,
        page: 0
      },
      () => {
        this.handleSubmit();
      }
    );
  };

  // Load up the user's favorite search. If one isn't defined yet, use some predefined details
  handleFavoritesClick = event => {
    const defaults = {
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
      exclude: ['twitchpresents2', 'food'],
      language: ['en']
    };

    const userFaves = JSON.parse(localStorage.getItem('favorites'));

    this.setState(userFaves || defaults, () => {
      this.handleSubmit();
    });
  };

  // Save the current search details in localStorage, as the user's favorites.
  saveFavoritesClick = event => {
    const { includeGames, include, exclude, language, includeTop } = this.state;

    if (
      confirm(
        `Are you sure you want to update your Favorites? \nThis new search has ${
          includeGames.length
        } games and ${include.length} streams, plus ${exclude.length} excluded`
      )
    ) {
      localStorage.setItem(
        'favorites',
        JSON.stringify({ includeGames, include, exclude, language, includeTop })
      );
    }
  };

  handleLoadMore = event => {
    this.setState(
      prevState => {
        return { page: prevState.page + 1 };
      },
      () => this.handleSubmit()
    );
  };

  getStreams(params) {
    this.setState({ loading: true });
    axios
      .get('/api/combo', {
        params
      })
      .then(res => {

        const results = res.data;


        this.setState(prevState => {
          return {
          games: results.games,
          includeGames: results.games.filter(game => game.selected).map(game => game.name),
          streams: this.mergeStreamResults(prevState.streams, results.streams),
          generatedTime: res.headers.date,
          pagination: results.pagination || undefined, //Upon reaching the final page from API, pagination returns as undefined
          loading: false
          }
        });
      })
      .catch(err => {
        this.setState({ loading: false });
      });
  }


  //Upon receiving a new page of results, combine them into the existing page of results, in order
  mergeStreamResults(prevState, newState) {
    return [...prevState, ...newState];

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
          exclude: this.state.exclude,
          streams_after: this.state.pagination,

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
      loading,
      pagination
    } = this.state;

    return (
      <div id="home" className="row py-1">
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
          saveFavoritesClick={this.saveFavoritesClick}
          loading={loading}
        />

        <Directory
          streams={streams}
          games={games}
          loading={loading}
          handleLoadMore={this.handleLoadMore}
          pagination={pagination}
        />
      </div>
    );
  }
}
