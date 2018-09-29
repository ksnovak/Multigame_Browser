import React, { Component } from 'react';
import './OptionsPane.css';

export default class MajorButton extends Component {
  componentDidMount() {
    // asdf
  }

  render() {
    const { handleHomeClick, handleFavoritesClick, saveFavoritesClick } = this.props;

    return (
      <div id="topButtons" className="buttonSet">
        <button id="home" className="btn btn-info" type="button" onClick={handleHomeClick}>
          Home
        </button>
        <button id="search" className="btn btn-primary" type="submit">
          Search
        </button>
        <button
          id="myFaves"
          className="btn btn-success"
          type="button"
          onClick={handleFavoritesClick}
        >
          Faves
        </button>
        <button
          id="saveFaves"
          className="btn btn-warning"
          type="button"
          onClick={saveFavoritesClick}
        >
          Save search
        </button>
      </div>
    );
  }
}
