import React, { Component } from 'react';
import './Directory.css';

export default class NoStreams extends Component {
  componentDidMount() {}

  render() {
    return (
      <div className="directory col-sm-10 col-lg-9 row">
        <span className="centeredText">
          No streams found. Try adding more games or names on the left side!
        </span>
      </div>
    );
  }
}
