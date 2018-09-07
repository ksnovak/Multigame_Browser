import React, { Component } from 'react';
import Select from 'react-select';
import CreatableSelect from 'react-select/lib/Creatable';
import './OptionsPane.css';
import PropTypes from 'prop-types';

export default class GamesList extends Component {
  componentDidMount() {
    // asdf
  }

  static getOptionValues(game) {
    return { value: game.name, label: game.name };
  }

  render() {
    const { games, handleListChange } = this.props;

    return (
      <div id="gamesList">
        <label>Games: </label>
        <CreatableSelect
          isClearable
          isMulti
          classNamePrefix="react-select"
          placeholder="What games would you like to see?"
          closeMenuOnSelect={false}
          onChange={handleListChange}
          options={games ? games.map(GamesList.getOptionValues) : null}
          value={games ? games.filter(game => game.selected).map(GamesList.getOptionValues) : null}
        />
      </div>
    );
  }
}

GamesList.propTypes = {
  games: PropTypes.arrayOf(PropTypes.object),
  handleListChange: PropTypes.func.isRequired
};

GamesList.defaultProps = {
  games: null
};
