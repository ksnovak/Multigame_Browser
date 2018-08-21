import React, { Component } from 'react';
import './app.css';
import OptionsPane from './OptionsPane/OptionsPane';
import Directory from './Directory';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
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
