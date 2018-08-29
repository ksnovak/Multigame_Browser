import React, { Component } from 'react';
import './OptionsPane.css';

export default class GeneratedAt extends Component {
	componentDidMount() {
		// asdf
	}

	render() {
		//Wed, 29 Aug 2018 04:57:49 GMT
		const { generatedTime } = this.props

		return (
			generatedTime ? (
				<div id='generatedAt'>
					Generated at <span>{new Date(generatedTime).toLocaleString()}</span>
				</div>) : null
		);
	}
}
