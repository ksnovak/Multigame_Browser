import React, { Component } from 'react';
import './OptionsPane.css';
import PropTypes from 'prop-types';

export default class OptionsButtons extends Component {
  componentDidMount() {
    // asdf
  }

  render() {
    const { languages, includeTop } = this.props;

    return (
      <div id="optionsButtons">
        <div>
          <label htmlFor="englishOnly">
            <input id="englishOnly" type="checkbox" defaultChecked={languages.includes('en')} />
            English only?
          </label>
          <br />

          <label htmlFor="includeTop">
            <input id="includeTop" type="checkbox" defaultChecked={includeTop} />
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
