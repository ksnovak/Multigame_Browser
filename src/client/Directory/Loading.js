import React, { Component } from 'react';
import './Directory.css';
import Spinner from 'react-spinkit';

export default class NoStreams extends Component {
  componentDidMount() {}

  render() {
    const { isLoading } = this.props;

    if (!isLoading) return null;

    return (
      <div id="loadingIndicator">
        <Spinner name="folding-cube" color="white" fadeIn="quarter" />
        <span>Loading streams...</span>
      </div>
    );
  }
}
