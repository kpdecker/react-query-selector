import React, { Fragment } from 'react';

export default function Functional() {
  return (
    <Fragment>
      <div data-attr="1">test</div>
      <div>test2</div>
      <aside key="2">test2</aside>
      <p>test3</p>
      <span />
    </Fragment>
  );
}
