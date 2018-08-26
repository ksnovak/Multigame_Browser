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
      includeTop: true,
      generatedTime: null
    };
  }

  componentDidMount() {
    fetch('/api/games/top?first=10')
      .then(res => res.json())
      .then((games) => {
        this.setState({ games, generatedTime: Date.now() });
      });
  }

  render() {
    const {
      games, include, exclude, languages, includeTop, generatedTime
    } = this.state;
    return (
      <div id="home" className="row">
        <OptionsPane
          games={games}
          include={include}
          exclude={exclude}
          languages={languages}
          includeTop={includeTop}
          generatedTime={generatedTime}
        />

        <Directory />
      </div>
    );
  }
}
