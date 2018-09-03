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
  constructor(props) {
    super(props);

    this.state = {
      newGameNames: [],
      newStreams: [],
      newExclude: []
    };
  }

  componentDidMount() {
    // asdf
  }


  // In the event of games being selected, created, or de-selected in the GamesList
  // NewValue is the new array of games; actionMeta is the action of the individual game that was just added/removed
  handleNewGames = (newValue, actionMeta) => {
    this.setState({ newGames: newValue.map(game => game.label) });
  };

  handleInclude = (newValue, actionMeta) => {
    this.setState({ include: newValue.map(name => name.label) });
  };

  handleExclude = (newValue, actionMeta) => {
    this.setState({ exclude: newValue.map(name => name.label) });
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
      version
    } = this.props;

    // Don't generate this panel if we haven't gotten the initial response from the server yet.
    if (generatedTime === null) {
      return null;
    }

    const simplifiedStreamsList = streams ? streams.map(stream => stream.login).sort() : null;

    return (
      <div className="optionsPane col-sm-6 col-lg-3 form-group">
        <form onSubmit={this.handleSubmit}>
          <TopButtons />
          <OptionsButtons language={language} includeTop={includeTop} />
          <GamesList games={games} handleNewGames={this.handleNewGames} />
          <TextList
            id="includeList"
            label="Include these users: "
            handleAction={this.handleInclude}
            list={simplifiedStreamsList}
            defaultSelected={include}
          />
          <TextList
            id="excludeList"
            label="Exclude these users: "
            handleAction={this.handleExclude}
            list={simplifiedStreamsList}
            defaultSelected={exclude}
          />
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
