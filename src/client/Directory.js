import React, { Component } from 'react';
import './Directory.css';

export default class Directory extends Component {
  constructor(props) {
    super(props);
    this.state = { username: null };
  }

  componentDidMount() {
    fetch('/api/getUsername')
      .then(res => res.json())
      .then(user => this.setState({ username: user.username }));
  }

  render() {
    return (
      <div className="directory col-sm-10 col-lg-9">
        {this.state.username ? (
          <h1>Welcome back {this.state.username}</h1>
        ) : (
          <h1>Loadeng.. please wait!</h1>
        )}
      </div>
    );
  }
}
