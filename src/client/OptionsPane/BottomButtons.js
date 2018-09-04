import React, { Component } from 'react';
import './OptionsPane.css';

export default class BottomButtons extends Component {
  componentDidMount() {
    // asdf
  }

  render() {
    const githubUrl = 'https://github.com/ksnovak/Multigame_Browser';
    return (
      <div className="buttonSet">
        <span>Links: </span>
        <br />
        <a href={githubUrl} rel="noopener" target="_blank" id="git_repo">
          Github
        </a>
        <br />
        <a href={`${githubUrl}/projects/1`} rel="noopener" target="_blank" id="git_board">
          Project Board
        </a>
        <br />
        <a
          href={`${githubUrl}/blob/master/CHANGELOG.md`}
          rel="noopener"
          target="_blank"
          id="changelog"
        >
          Change log
        </a>
        <br />
        <a href={`${githubUrl}/blob/master/README.md`} rel="noopener" target="_blank" id="readme">
          Readme
        </a>
        <br />
        <a href="https://twitter.com/Funkotronics" rel="noopener" target="_blank" id="twitter">
          Twitter
        </a>
      </div>
    );
  }
}
