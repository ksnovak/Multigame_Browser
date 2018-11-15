import React, { Component } from 'react';
import './Directory.css';
import Spinner from 'react-spinkit';

export default class NoStreams extends Component {
  componentDidMount() {}

  render() {
    const { isLoading } = this.props;

    return (
      <div id="loadingIndicator" className={isLoading ? 'show' : 'hide'}>
        <Spinner name="folding-cube" fadeIn="none" />
        <span>Loading streams...</span>
      </div>
    );
  }
}
