import React, { Component } from 'react';
import './OptionsPane.css';

export default class MajorButton extends Component {
  componentDidMount() {
    // asdf
  }

  render() {
    return (
      <div id="topButtons">
        <a href="/" id="home" className="btn btn-info" role="button">
					Home
        </a>
        <button id="search" className="btn btn-primary" type="submit">
					Search
        </button>
        <button id="myFaves" className="btn btn-success" type="button">
					My favorites
        </button>
      </div>
    );
  }
}
