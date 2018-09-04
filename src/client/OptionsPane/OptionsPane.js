import React, { Component } from 'react';
import './OptionsPane.css';
import PropTypes from 'prop-types';
import GamesList from './GamesList';
import TextList from './TextList';
import TopButtons from './TopButtons';
import BottomButtons from './BottomButtons';
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
      streams,
      include,
      exclude,
      generatedTime,
      version,
      handleSubmit,
      handleFavoritesClick,
      handleHomeClick
    } = this.props;

    // Don't generate this panel if we haven't gotten the initial response from the server yet.
    if (generatedTime === null) {
      return null;
    }

    const simplifiedStreamsList = streams ? streams.map(stream => stream.login).sort() : null;

    return (
      <div className="optionsPane col-sm-6 col-lg-3 form-group">
        <form onSubmit={handleSubmit}>
          <TopButtons
            handleFavoritesClick={handleFavoritesClick}
            handleHomeClick={handleHomeClick}
          />
          <OptionsButtons language={language} includeTop={includeTop} />
          <GamesList games={games} handleListChange={this.handleListChange('includeGames')} />
          <br />
          <TextList
            id="includeList"
            label="Include these users: "
            handleListChange={this.handleListChange('include')}
            list={simplifiedStreamsList}
            defaultSelected={include}
          />
          {/* <br />
          <TextList
            id="excludeList"
            label="Exclude these users: "
            handleListChange={this.handleListChange('exclude')}
            list={simplifiedStreamsList}
            defaultSelected={exclude}
          /> */}
          <br />
          <br />
          <BottomButtons />
          <GeneratedAt generatedTime={generatedTime} version={version} />
        </form>
      </div>
    );
  }
}
OptionsPane.propTypes = {
  language: PropTypes.arrayOf(PropTypes.string).isRequired,
  includeTop: PropTypes.bool.isRequired,
  games: PropTypes.arrayOf(PropTypes.object),
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
