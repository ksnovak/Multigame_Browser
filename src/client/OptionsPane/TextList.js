import React, { Component } from 'react';
import './OptionsPane.css';

export default class TextList extends Component {
  componentDidMount() {
    // asdf
  }

  render() {
    const { label, list, id } = this.props;

    return (
      <div>
        <label htmlFor="{id}">{label}</label>
        <input
          type="text"
          className="form-control"
          defaultValue={list.join(', ')}
        />
      </div>
    );
  }
}
