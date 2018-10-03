import React, { Component } from 'react';
import './OptionsPane.css';
import PropTypes from 'prop-types';
import TextList from './TextList';
import TopButtons from './TopButtons';
import OptionsButtons from './OptionsButtons';
import GeneratedAt from './GeneratedAt';

export default class OptionsPane extends Component {
  componentDidMount() {
    // asdf
  }

  handleListChange = name => (newValue, actionMeta) => {
    if (this.props.handleListChange) {
      this.props.handleListChange(name, newValue);
    }
  };

  render() {
    const {
      language,
      includeTop,
      games,
      includeGames,
      streams,
      include,
      exclude,
      generatedTime,
      version,
      handleSubmit,
      handleFavoritesClick,
      handleHomeClick,
      handleToggle,
      saveFavoritesClick
    } = this.props;

    const simplifiedStreamsList = streams ? streams.map(stream => stream.name) : [];

    return (
      <div className="optionsPane col-sm-6 col-lg-3 form-group">
        <form onSubmit={handleSubmit}>
          <TopButtons
            handleFavoritesClick={handleFavoritesClick}
            handleHomeClick={handleHomeClick}
            saveFavoritesClick={saveFavoritesClick}
            searchHasDetails={includeGames.length + include.length > 0}
          />
          <OptionsButtons language={language} includeTop={includeTop} handleToggle={handleToggle} />
          <TextList
            label="Games:"
            placeholder="What games would you like to see?"
            list={games.map(game => game.name)}
            defaultSelected={includeGames}
            handleListChange={this.handleListChange('includeGames')}
          />
          <br />
          <TextList
            label="Include these users: "
            placeholder="Enter some names"
            handleListChange={this.handleListChange('include')}
            list={simplifiedStreamsList}
            defaultSelected={include}
          />
          <br />
          <TextList
            id="excludeList"
            label="Exclude these users: "
            placeholder="Enter some names"
            handleListChange={this.handleListChange('exclude')}
            list={simplifiedStreamsList}
            defaultSelected={exclude}
          />
          <br />
          <br />
        </form>

        <div className="floatBottom">
          <GeneratedAt generatedTime={generatedTime} version={version} />
        </div>
      </div>
    );
  }
}
OptionsPane.propTypes = {
  language: PropTypes.arrayOf(PropTypes.string).isRequired,
  includeTop: PropTypes.bool.isRequired,
  games: PropTypes.arrayOf(PropTypes.object).isRequired,
  include: PropTypes.arrayOf(PropTypes.string).isRequired,
  exclude: PropTypes.arrayOf(PropTypes.string).isRequired,
  generatedTime: PropTypes.string,
  version: PropTypes.string
};

OptionsPane.defaultProps = {
  games: null,
  generatedTime: null,
  version: null
};
