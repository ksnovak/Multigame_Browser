import React, { Component } from 'react';
import './OptionsPane.css';

export default class GithubButtons extends Component {
  componentDidMount() {
    // asdf
  }

  render() {
    return (
      <div className="buttonSet">
        <a
          href="https://github.com/ksnovak/Multigame_Browser"
          target="_blank"
          id="git_repo"
          className="btn btn-warning"
          role="button"
        >
					Github
        </a>
        <a
          href="https://github.com/ksnovak/Multigame_Browser/projects/1"
          target="_blank"
          id="git_board"
          className="btn btn-danger"
          role="button"
        >
					Project Board
        </a>
      </div>
    );
  }
}
