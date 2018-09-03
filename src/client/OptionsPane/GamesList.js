import React, { Component } from 'react';
import Select from 'react-select';
import CreatableSelect from 'react-select/lib/Creatable';
import './OptionsPane.css';
import PropTypes from 'prop-types';

const customStyles = {
  option: (base, state) => ({
    ...base,
    color: '#777777'
  })
};

export default class GamesList extends Component {
  componentDidMount() {
    // asdf
  }

  static getOptionValues(game) {
    return { value: game.name, label: game.name };
  }

  render() {
    const { games, handleNewGames } = this.props;

    if (games) {
      return (
        <div id="gamesList">
          <CreatableSelect
            isClearable
            isMulti
            styles={customStyles}
            placeholder="What games would you like to see?"
            closeMenuOnSelect={false}
            onChange={handleNewGames}
            options={games.map(GamesList.getOptionValues)}
            defaultValue={games.filter(game => game.selected).map(GamesList.getOptionValues)}
          />
        </div>
      );
    }

    return null;
  }
}

GamesList.propTypes = {
  games: PropTypes.arrayOf(PropTypes.object)
};

GamesList.defaultProps = {
  games: null
};
