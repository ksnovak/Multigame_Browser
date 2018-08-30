import React, { Component } from 'react';
import './OptionsPane.css';

export default class GeneratedAt extends Component {
  componentDidMount() {
    // asdf
  }

  render() {
    // Wed, 29 Aug 2018 04:57:49 GMT
    const { generatedTime, version } = this.props;

    return generatedTime && version ? (
      <div id="generatedAt">
        Generated at <span id="generatedTime">{new Date(generatedTime).toLocaleString()}</span>
        <div id="version">v{version}</div>
      </div>
    ) : null;
  }
}
