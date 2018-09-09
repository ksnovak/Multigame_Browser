import React, { Component } from 'react';
import './OptionsPane.css';
import PropTypes from 'prop-types';

export default class OptionsButtons extends Component {
  componentDidMount() {
    // asdf
  }

  handleTog = name => event => {
    if (this.props.handleToggle) {
      this.props.handleToggle(name, event.target.checked);
    }
  };

  render() {
    const { language, includeTop } = this.props;

    return (
      <div id="optionsButtons">
        <div>
          <label htmlFor="englishOnly">
            <input
              id="englishOnly"
              type="checkbox"
              checked={language.includes('en')}
              onChange={this.handleTog('language')}
            />
            English only?
          </label>
          <br />

          <label htmlFor="includeTop">
            <input
              id="includeTop"
              type="checkbox"
              checked={includeTop}
              onChange={this.handleTog('includeTop')}
            />
            Include Top games?
          </label>
        </div>
      </div>
    );
  }
}

OptionsButtons.defaultProps = {
  englishOnly: true,
  includeTop: false
};
