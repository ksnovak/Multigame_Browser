import React, { Component } from 'react';
import './OptionsPane.css';
import AnimateOnChange from 'react-animate-on-change';

export default class GeneratedAt extends Component {
  componentDidMount() {
    // asdf
  }

  render() {
    // Wed, 29 Aug 2018 04:57:49 GMT
    const { generatedTime, version } = this.props;

    if (!generatedTime || !version) {
      return null;
    }

    return (
      <div id="generatedAt">
        Streams updated at&nbsp;
        <AnimateOnChange
          baseClassName="generatedTime"
          animationClassName="generatedTime--animate"
          animate
        >
          {new Date(generatedTime).toLocaleTimeString()}
        </AnimateOnChange>
        <div id="version">version {version}</div>
      </div>
    );
  }
}
