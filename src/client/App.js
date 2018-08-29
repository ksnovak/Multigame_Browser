import React, { Component } from 'react';
import './app.css';
import OptionsPane from './OptionsPane/OptionsPane';
import Directory from './Directory';
import queryString from 'query-string';
import axios from 'axios';

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
    let qs = queryString.parse(location.search);
    console.log(qs)

    axios.get('/api/combo', {
      params: {
        includetop: qs.includeTop || false,
        name: qs.name
      }
    })
      .then(res => {

        this.setState({
          games: res.data.games,
          streams: res.data.streams,
          generatedTime: res.headers.date
        })
      })
  }

  render() {
    const { games, include, exclude, languages, includeTop, generatedTime } = this.state;
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
