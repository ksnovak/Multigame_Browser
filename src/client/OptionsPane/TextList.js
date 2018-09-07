import React, { Component } from 'react';
import Select from 'react-select';
import CreatableSelect from 'react-select/lib/Creatable';
import './OptionsPane.css';
import PropTypes from 'prop-types';

function getValueAndLabel(arr) {
  if (arr === null || arr === undefined) {
    return null;
  }

  if (Array.isArray(arr)) {
    return arr.map(name => ({ value: name, label: name }));
  }
  return { value: arr, label: arr };
}

function mergeArrays(special, base) {
  let newArr = [];

  if (Array.isArray(special)) {
    newArr = Array.from(special);
  }
  else if (special !== null && special !== undefined) {
    newArr.push(special);
  }

  if (Array.isArray(base)) {
    base.forEach((name) => {
      if (!newArr.includes(name)) newArr.push(name);
    });
  }
  else if (base !== null && base !== undefined) {
    if (!newArr.includes(base)) newArr.push(base);
  }

  return newArr;
}

export default class TextList extends Component {
  componentDidMount() {
    // asdf
  }

  render() {
    const { label, list, defaultSelected, id, handleListChange } = this.props;

    return (
      <div className="textList">
        <label>{label}</label>
        <CreatableSelect
          id={id}
          isClearable
          isMulti
          classNamePrefix="react-select"
          placeholder={label}
          closeMenuOnSelect={false}
          onChange={handleListChange}
          options={getValueAndLabel(mergeArrays(defaultSelected, list))}
          value={getValueAndLabel(defaultSelected)}
        />
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
