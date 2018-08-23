import React, { Component } from 'react';
import './OptionsPane.css';
import PropTypes from 'prop-types';

export default class GamesList extends Component {
  componentDidMount() {
    // asdf
  }

  render() {
    const { games } = this.props;

    if (games) {
      const optionList = games.map(game => (
        <option key={game.id}>{game.name}</option>
      ));
      return (
        <select id="gameList" multiple="multiple" size="10">
          {optionList}
        </select>
      );
    }
    return <select id="gameList" multiple="multiple" size="10" />;
  }
}

GamesList.propTypes = {
  games: PropTypes.arrayOf(PropTypes.object)
};

GamesList.defaultProps = {
  games: null
};
