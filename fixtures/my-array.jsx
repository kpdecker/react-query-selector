import React, { Component } from 'react';

export default class MyArray extends Component {
  render() {
    return [
      <div key="1">
        <span value={1} />
      </div>,
      <div key="2">
        <span value={2} />
      </div>
    ];
  }
}
