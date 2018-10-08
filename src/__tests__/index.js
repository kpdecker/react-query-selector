import React from 'react';
import ReactQuerSelector, { querySelector, querySelectorAll } from '..';
import { generatePath } from '../generate';
import MyComponent from '../../fixtures/my-component';
import { setupReactDom } from '../global-hook';

const App = () => {
  return (
    <div>
      <p>React here!</p>
    </div>
  );
};

let hook;
global.__REACT_DEVTOOLS_GLOBAL_HOOK__ = hook = {
  _renderers: [],
  _fiberRoots: [],
  inject: instance => {
    hook._renderers.push(instance);
    hook._fiberRoots.push([]);
    setupReactDom(instance);
    return hook._renderers.length - 1;
  },
  onCommitFiberRoot: jest.fn((rendererId, root) => {
    hook._fiberRoots[rendererId].push(root);
  }),
  onCommitFiberUnmount: (rendererId, root) => {
    hook._fiberRoots[rendererId] = hook._fiberRoots[rendererId].filter(
      current => current !== root
    );
  },
  supportsFiber: true
};

describe('react-query-selector', () => {
  const container = document.body.appendChild(document.createElement('div'));
  beforeEach(() => {
    hook.onCommitFiberRoot.mockClear();

    ReactDOM.unmountComponentAtNode(container);
    container.innerHTML = '';
  });

  // Must come after global above to ensure init state.
  // We may want to move the mock above into a setup file ast some point
  const ReactDOM = require('react-dom');

  test('it should inject into global hook', () => {
    ReactDOM.render(<App />, container);

    expect(hook.onCommitFiberRoot).toHaveBeenCalledTimes(1);
    expect(hook._renderers).toHaveLength(1);
  });

  describe('generatePath', () => {
    it('should provide path for named elements', () => {
      ReactDOM.render(<App />, container);

      const el = container.querySelector('p');
      const path = generatePath(el);
      expect(path).toMatchSnapshot();
      expect(querySelector(path)).toBe(el);
    });
    it('should provide path for anonymous elements', () => {
      ReactDOM.render(<p>value</p>, container);

      const el = container.querySelector('p');
      const path = generatePath(el);
      expect(path).toMatchSnapshot();
      expect(querySelector(path)).toBe(el);
    });

    it('should provide path for nested elements', () => {
      ReactDOM.render(<MyComponent />, container);

      const el = container.querySelector('p');
      const path = generatePath(el);
      expect(path).toMatchSnapshot();
      expect(querySelector(path)).toBe(el);

      const path2 = generatePath(el.previousElementSibling);
      expect(path2).toMatchSnapshot();
      expect(querySelector(path2)).toBe(el.previousElementSibling);
    });

    it('should provide unique path for multiple elements', () => {
      ReactDOM.render(
        <span>
          <MyComponent />
          <MyComponent />
        </span>,
        container
      );

      const el = container.querySelector('p');
      const path = generatePath(el);
      expect(path).toMatchSnapshot();
      expect(querySelector(path)).toBe(el);

      const path2 = generatePath(el.previousElementSibling);
      expect(path2).toMatchSnapshot();
      expect(querySelector(path2)).toBe(el.previousElementSibling);
    });

    it('should provide unique path from key', () => {
      ReactDOM.render(
        <span>
          <MyComponent />
          <MyComponent key={1} />
        </span>,
        container
      );

      const el = querySelector('<MyComponent>[key=1]');
      const path = generatePath(el);
      expect(path).toMatchSnapshot();
      expect(querySelector(path)).toBe(el);
    });
  });

  describe('querySelectorAll', () => {
    it('should return multiple elements', () => {
      ReactDOM.render(
        <span>
          <MyComponent />
          <MyComponent />
        </span>,
        container
      );

      expect(querySelectorAll('<Functional>')).toHaveLength(2);
    });
    it('should query props', () => {
      ReactDOM.render(
        <span>
          <MyComponent />
          <MyComponent prop="test" />
        </span>,
        container
      );

      expect(querySelectorAll('[prop]')).toHaveLength(1);
      expect(querySelectorAll('<MyComponent>[prop]')).toHaveLength(1);
      expect(querySelectorAll('<MyComponent>[prop="test"]')).toHaveLength(1);

      expect(querySelectorAll('[data-attr=1]')).toHaveLength(2);
      expect(querySelectorAll('[data-attr=2]')).toHaveLength(0);
    });

    it('should limit to children', () => {
      ReactDOM.render(
        <span>
          <MyComponent />
          <MyComponent prop="test" />
        </span>,
        container
      );

      expect(querySelectorAll('<MyComponent> > div')).toHaveLength(2);
    });

    it('should support :empty', () => {
      ReactDOM.render(
        <span>
          <MyComponent />
          <MyComponent prop="test" />
        </span>,
        container
      );

      expect(querySelectorAll('span:empty')).toHaveLength(2);
    });

    it('should support key', () => {
      ReactDOM.render(
        <span>
          <MyComponent />
          <MyComponent key={1} />
        </span>,
        container
      );

      expect(querySelectorAll('span:empty')).toHaveLength(2);
    });
  });

  describe('scoping', () => {
    it('should return multiple elements', () => {
      ReactDOM.render(
        <span>
          <MyComponent />
          <MyComponent />
        </span>,
        container
      );

      expect(querySelectorAll('<Functional>', document)).toHaveLength(2);
      expect(
        querySelectorAll('<Functional>', document.createElement('div'))
      ).toHaveLength(0);
      expect(
        querySelectorAll('<Functional>', querySelector('<MyComponent>'))
      ).toHaveLength(1);
      expect(
        querySelectorAll('<Functional>', querySelector('span'))
      ).toHaveLength(2);
    });
  });
});
