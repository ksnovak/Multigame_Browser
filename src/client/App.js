import React, { Component } from 'react';
import './app.css';
import OptionsPane from './OptionsPane/OptionsPane';
import Directory from './Directory';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      games: null,
      // streams: null,
      include: [],
      exclude: [],
      languages: [],
      includeTop: true
    };
  }

  componentDidMount() {
    fetch('/api/games/top?first=10')
      .then(res => res.json())
      .then((games) => {
        this.setState({ games });
      });
  }

  render() {
    const {
      games, include, exclude, languages, includeTop
    } = this.state;
    return (
      <div id="home" className="row">
        <OptionsPane
          games={games}
          include={include}
          exclude={exclude}
          languages={languages}
          includeTop={includeTop}
        />

        <Directory />
      </div>
    );
  }
}
