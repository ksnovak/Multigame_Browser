import React, { Component } from 'react';

const githubUrl = 'https://github.com/ksnovak/Multigame_Browser';

const links = [
  // { name: 'About', url: ''}, //Soon!
  { name: 'Github', url: githubUrl },
  { name: 'Project Board', url: `${githubUrl}/projects/1` },
  { name: 'Change log', url: `${githubUrl}/blob/master/CHANGELOG.md` },
  { name: 'Readme', url: `${githubUrl}/blob/master/README.md` },
  { name: 'Twitch', url: 'https://www.twitch.tv/directory/all' }
];

export default class BottomLinks extends Component {
  componentDidMount() {
    // asdf
  }

  render() {
    return (
      <div className="bottomLinks text-center">
        <span>Helpful Links: </span>
        {links.map(link => (
          <a href={link.url} rel="noopener noreferrer" target="_blank">
            {link.name}
          </a>
        ))}
      </div>
    );
  }
}
