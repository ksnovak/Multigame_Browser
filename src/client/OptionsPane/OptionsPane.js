import React, { Component } from 'react';
import './OptionsPane.css';
import PropTypes from 'prop-types';
import GamesList from './GamesList';
import TextList from './TextList';
import TopButtons from './TopButtons';
import BottomButtons from './BottomButtons';
import OptionsButtons from './OptionsButtons';

export default class OptionsPane extends Component {
  componentDidMount() {
    // asdf
  }

  render() {
    const {
      languages, includeTop, games, include, exclude
    } = this.props;
    return (
      <div className="optionsPane col-sm-2 col-lg-3 form-group">
        <form>
          <TopButtons />

          <OptionsButtons
            englishOnly={languages.includes('en')}
            includeTop={includeTop}
          />

          <GamesList games={games} />

          <TextList id="includeGames" label="Additional games: " />

          <TextList
            id="includeList"
            label="Include these users: "
            list={include}
          />

          <TextList
            id="excludeList"
            label="Exclude these users: "
            list={exclude}
          />

          <BottomButtons />
        </form>
      </div>
    );
  }
}
OptionsPane.propTypes = {
  languages: PropTypes.arrayOf(PropTypes.string).isRequired,
  includeTop: PropTypes.bool.isRequired,
  games: PropTypes.arrayOf(PropTypes.object),
  include: PropTypes.arrayOf(PropTypes.object).isRequired,
  exclude: PropTypes.arrayOf(PropTypes.object).isRequired
};

OptionsPane.defaultProps = {
  games: null
};
