import React, { Component } from 'react';
import './Directory.css';

export default class LoadMore extends Component {
  componentDidMount() {}

  render() {
    const { handleClick } = this.props;

    return (
      <button id="loadMore" className="btn btn-success" type="button" onClick={handleClick}>
        Load More
      </button>
    );
  }
}
