import React, { Component } from 'react';
import './OptionsPane.css';
import PropTypes from 'prop-types';

export default class OptionsButtons extends Component {
  componentDidMount() {
    // asdf
  }

  render() {
    const { englishOnly, includeTop } = this.props;

    return (
      <div id="optionsButtons">
        <label className="custom-control-label" htmlFor="englishOnly">
          <input
            className="custom-control-input"
            id="englishOnly"
            type="checkbox"
            checked={englishOnly}
          />
					English only?
        </label>
        <br />

        <label className="custom-control-label" htmlFor="includeTop">
          <input
            className="custom-control-input"
            id="includeTop"
            type="checkbox"
            checked={includeTop}
          />
					Include Top games?
        </label>
      </div>
    );
  }
}

OptionsButtons.defaultProps = {
  englishOnly: true,
  includeTop: false
};
