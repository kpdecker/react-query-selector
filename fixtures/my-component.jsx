import React, { Component } from 'react';
import Functional from './functional';

export default class MyComponent extends Component {
  render() {
    return (
      <div>
        <Functional value={this.props.value} />
        and text!
      </div>
    );
  }
}
