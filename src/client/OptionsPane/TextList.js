import React, { Component } from 'react';
import './OptionsPane.css';
import PropTypes from 'prop-types';

export default class TextList extends Component {
  componentDidMount() {
    // asdf
  }

  render() {
    const { label, list, id } = this.props;

    return (
      <div>
        <label htmlFor={id}>
          {label}
          <input
            type="text"
            className="form-control"
            defaultValue={list.join(', ')}
          />
        </label>
      </div>
    );
  }
}

TextList.propTypes = {
  label: PropTypes.string.isRequired,
  list: PropTypes.arrayOf(PropTypes.string),
  id: PropTypes.string.isRequired
};

TextList.defaultProps = {
  list: []
};
