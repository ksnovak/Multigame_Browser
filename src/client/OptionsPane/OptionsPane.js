import React, { Component } from 'react';
import './OptionsPane.css';
import GamesList from './GamesList';
import TextList from './TextList';
import TopButtons from './TopButtons';
import GithubButtons from './GithubButtons';
import OptionsButtons from './OptionsButtons';

export default class OptionsPane extends Component {
  componentDidMount() {
    // asdf
  }

  render() {
    return (
      <div className="optionsPane col-sm-2 col-lg-3">
        <TopButtons />

        <OptionsButtons
          englishOnly={this.props.languages == 'en'}
          includeTop={this.props.includeTop}
        />

        <GamesList games={this.props.games} />

        <TextList
          id="includeList"
          label="Include these users: "
          list={this.props.include}
        />

        <TextList
          id="excludeList"
          label="Exclude these users: "
          list={this.props.exclude}
        />

        <GithubButtons />
      </div>
    );
  }
}
