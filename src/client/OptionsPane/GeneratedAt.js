import React, { Component } from 'react';
import './OptionsPane.css';
import AnimateOnChange from 'react-animate-on-change';

export default class GeneratedAt extends Component {
  constructor(props) {
    super(props);

    this.state = {
      generatedTime: null,
      isAnimating: false
    };
  }

  componentDidMount() {
    // asdf
  }

  render() {
    // Wed, 29 Aug 2018 04:57:49 GMT
    const { generatedTime, version } = this.props;

    if (!generatedTime || !version) {
      return null;
    }

    if (generatedTime != this.state.generatedTime) {
      this.setState({ generatedTime, isAnimating: true });
    }

    return (
      <div id="generatedAt">
        Streams updated at
        <AnimateOnChange
          baseClassName="generatedTime"
          animationClassName="generatedTime--animate"
          animate={this.state.isAnimating}
          onAnimationEnd={() => {
            this.setState({ isAnimating: false });
          }}
        >
          {new Date(generatedTime).toLocaleTimeString()}
        </AnimateOnChange>
        <div id="version">
          version{' '}
          <a href="https://github.com/ksnovak/Multigame_Browser/blob/master/CHANGELOG.md">
            {version}
          </a>
        </div>
      </div>
    );
  }
}
