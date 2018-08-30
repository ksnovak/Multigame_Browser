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
          includetop: qs.includeTop || false,
          name: qs.name
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

  render() {
    const { streams, games, include, exclude, languages, includeTop, generatedTime } = this.state;
    return (
      <div id="home" className="row">
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
