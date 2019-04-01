import React, { Component } from 'react';
import './OptionsPane.css';
import PropTypes from 'prop-types';

export default class TopButtons extends Component {
  componentDidMount() {
    // asdf
  }

  render() {
    const {
      handleHomeClick,
      handleFavoritesClick,
      saveFavoritesClick,
      searchHasDetails
    } = this.props;

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
          disabled={!searchHasDetails}
          title={
            searchHasDetails
              ? ''
              : 'Disabled because you have no games or streams selected in your search'
          }
        >
          Save search
        </button>
      </div>
    );
  }
}

TopButtons.propTypes = {
  handleHomeClick: PropTypes.func.isRequired,
  handleFavoritesClick: PropTypes.func.isRequired,
  saveFavoritesClick: PropTypes.func.isRequired,
  searchHasDetails: PropTypes.bool
};

TopButtons.defaultProps = {
  searchHasDetails: false
};
