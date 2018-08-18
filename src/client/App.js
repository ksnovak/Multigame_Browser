import React, { Component } from 'react';
import './app.css';
import ReactImage from './react.png';
import OptionsPane from './OptionsPane/OptionsPane';
import Directory from './Directory';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = { username: null };
  }

  componentDidMount() {}

  render() {
    return (
      <div id="home" className="row">
        <OptionsPane />

        <Directory />
      </div>
    );
  }
}
