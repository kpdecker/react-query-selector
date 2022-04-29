import React, { Fragment, Suspense, lazy, forwardRef } from 'react';
import ReactQuerSelector, {
  querySelector,
  querySelectorAll,
  dumpTree
} from '..';
import { generatePath } from '../generate';
import MyComponent from '../../fixtures/my-component';
import MyArray from '../../fixtures/my-array';
import { componentDOMNodes } from '../map';

const App = () => {
  return (
    <div>
      <p>React here!</p>
    </div>
  );
};

const hook = global.__REACT_DEVTOOLS_GLOBAL_HOOK__;
hook.onCommitFiberRoot = jest.fn(hook.onCommitFiberRoot);

describe('react-query-selector', () => {
  const container = document.body.appendChild(document.createElement('div'));
  container.className = 'host';

  beforeEach(() => {
    hook.onCommitFiberRoot.mockClear();

    if (container.innerHTML) {
      ReactDOM.unmountComponentAtNode(container);
      container.innerHTML = '';
    }
  });

  // Must come after global above to ensure init state.
  // We may want to move the mock above into a setup file ast some point
  const ReactDOM = require('react-dom');

  test('it should inject into global hook', () => {
    ReactDOM.render(<App />, container);

    expect(hook.onCommitFiberRoot).toHaveBeenCalledTimes(1);
    expect(hook.renderers).toHaveLength(1);
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
    it('should return when scoped above root', () => {
      ReactDOM.render(
        <span>
          <MyComponent />
          <MyComponent />
        </span>,
        container
      );

      expect(querySelectorAll('.host <Functional>')).toHaveLength(2);
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
      expect(querySelectorAll('[key=2]')).toHaveLength(2);
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

    it('should support attributes on functional elements', () => {
      ReactDOM.render(
        <span>
          <MyComponent />
          <MyComponent value={4} />
        </span>,
        container
      );

      expect(querySelectorAll('<Functional>[value]')).toHaveLength(1);
      expect(querySelectorAll('<Functional>[value=4]')).toHaveLength(1);
    });

    it('should support attributes on memo elements', () => {
      const MyFunction = () => 'test';
      const Memo = React.memo(MyFunction);
      ReactDOM.render(
        <span>
          <MyFunction />
          <Memo value={4} />
        </span>,
        container
      );

      expect(dumpTree()).toMatchSnapshot();
      expect(querySelectorAll('<MyFunction>[value]')).toHaveLength(1);
      expect(querySelectorAll('<MyFunction>[value=4]')).toHaveLength(1);
    });

    it('should support attributes on lazy + suspense elements', (done) => {
      const OtherComponent = lazy(() =>
        Promise.resolve({ default: () => <nav>here</nav> })
      );

      function MySuspense() {
        return (
          <Suspense fallback={<aside>Loading...</aside>}>
            <OtherComponent />
          </Suspense>
        );
      }
      const MyFunction = () => 'test';
      const Memo = React.memo(MyFunction);
      ReactDOM.render(
        <span>
          <MySuspense />
          <MySuspense value={4} />
        </span>,
        container
      );

      expect(dumpTree()).toMatchSnapshot();
      expect(querySelectorAll('aside')).toHaveLength(2);
      expect(querySelectorAll('nav')).toHaveLength(0);
      expect(querySelectorAll('<MySuspense>[value]')).toHaveLength(1);
      expect(querySelectorAll('<MySuspense>[value=4]')).toHaveLength(1);

      setTimeout(() => {
        expect(dumpTree()).toMatchSnapshot();
        expect(querySelectorAll('aside')).toHaveLength(0);
        expect(querySelectorAll('nav')).toHaveLength(2);
        done();
      }, 100);
    });
    it('should support forwardRef', () => {
      const MyFunction = () => <aside />;
      const ForwardRef = forwardRef(MyFunction);
      ReactDOM.render(
        <span>
          <MyFunction />
          <ForwardRef value={4}/>
        </span>,
        container
      );

      expect(dumpTree()).toMatchSnapshot();
      expect(querySelectorAll('aside')).toHaveLength(2);
      expect(querySelectorAll('<MyFunction>[value]')).toHaveLength(1);
      expect(querySelectorAll('<MyFunction>[value=4]')).toHaveLength(1);
    });
    it('should support ContextProvider', () => {
      const MyFunction = () => <aside />;
      const Context = React.createContext({test: "test"});
      ReactDOM.render(
        <span>
          <MyFunction />
          <Context.Provider>
            <MyFunction />
          </Context.Provider>
        </span>,
        container
      );

      expect(dumpTree()).toMatchSnapshot();
      expect(querySelectorAll('aside')).toHaveLength(2);
      
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
    it('should scope to secondary child', () => {
      ReactDOM.render(
        <span>
          <MyComponent />
          <MyComponent value={4} />
        </span>,
        container
      );

      const functional = querySelectorAll(
        '<Functional>',
        querySelector('<MyComponent>:nth-child(2)')
      );
      expect(functional).toHaveLength(1);
      expect(functional[0].props.value).toBe(4);
    });

    it('should scope to array components', () => {
      ReactDOM.render(
        <span>
          <MyArray />
          <span />
        </span>,
        container
      );

      expect(querySelectorAll('span')).toHaveLength(4);
      expect(querySelectorAll('span', querySelector('<MyArray>'))).toHaveLength(
        2
      );
    });
  });
  it('should scope to DOM components', () => {
    ReactDOM.render(
      <div>
        <MyArray />
        <span />
      </div>,
      container
    );

    expect(
      querySelectorAll('span', document.querySelector('div'))
    ).toHaveLength(3);
  });

  describe('componentDOMNodes', () => {
    it('should return fragments', () => {
      ReactDOM.render(
        <span>
          <MyComponent />
          <MyComponent />
          <Fragment>
            <div />
            <div />
          </Fragment>
        </span>,
        container
      );

      expect(componentDOMNodes(querySelector('<Fragment>'))).toHaveLength(2);
    });
    it('should return Arrays', () => {
      ReactDOM.render(
        <span>
          <MyArray />
          <MyComponent />
          <Fragment>
            <div />
            <div />
          </Fragment>
        </span>,
        container
      );

      expect(componentDOMNodes(querySelector('<MyArray>'))).toHaveLength(2);
    });
    it('should return null values', () => {
      const MyFunction = () => null;
      const Memo = React.memo(MyFunction);
      ReactDOM.render(
        <span>
          <Memo />
        </span>,
        container
      );

      //  Not throwing is part of success case
      expect(componentDOMNodes(querySelector('<MyFunction>'))).toHaveLength(0);
    });
  });

  describe('dumpTree', () => {
    it('should handle fragments', () => {
      ReactDOM.render(
        <span>
          <MyComponent />
          <MyComponent />
          <Fragment>
            <div />
            <div />
          </Fragment>
        </span>,
        container
      );

      expect(dumpTree()).toMatchSnapshot();
    });
    it('should handle foreardRef', () => {
      const Forward = forwardRef(() => <div />)
      ReactDOM.render(
        <span>
          <MyComponent />
          <MyComponent />
          <Forward />
        </span>,
        container
      );

      expect(dumpTree()).toMatchSnapshot();
    });
    it('should handle ContextProvider', () => {
      const Context = React.createContext({test: "test"});
      ReactDOM.render(
        <span>
          <MyComponent />
          <Context.Provider>
            <MyComponent />
          </Context.Provider>
        </span>,
        container
      );

      expect(dumpTree()).toMatchSnapshot();
    });
  });

  describe('multiple roots', () => {
    it('should handle sibling roots', () => {
      const thing1 = document.createElement('div');
      thing1.className = 'thing1';
      const thing2 = document.createElement('div');
      thing2.className = 'thing2';

      const injectContainer = document.createElement('div');
      injectContainer.appendChild(thing1);
      injectContainer.appendChild(thing2);
      document.body.append(injectContainer);

      ReactDOM.render(<App />, thing1);
      ReactDOM.render(<App />, thing2);

      expect(querySelectorAll('p')).toHaveLength(2);
      expect(querySelectorAll('.thing1 p')).toHaveLength(1);
      expect(querySelectorAll('.thing2 p')).toHaveLength(1);

      ReactDOM.unmountComponentAtNode(thing1);
      ReactDOM.unmountComponentAtNode(thing2);
    });
    it('should handle nested roots', () => {
      function Thing1() {
        return <div></div>;
      }

      ReactDOM.render(
        <div>
          <Thing1 />
        </div>,
        container
      );
      const injectContainer = componentDOMNodes(querySelector('<Thing1>'))[0];
      ReactDOM.render(<App />, injectContainer);

      expect(querySelectorAll('p')).toHaveLength(1);
      expect(querySelectorAll('<Thing1> p')).toHaveLength(1);

      ReactDOM.unmountComponentAtNode(injectContainer);
    });
    it('should handle deeply nested roots', () => {
      function Thing1() {
        return <div></div>;
      }

      ReactDOM.render(
        <div>
          <Thing1 />
        </div>,
        container
      );
      const injectContainer = componentDOMNodes(querySelector('<Thing1>'))[0];
      const injectChild = document.createElement('div');
      injectContainer.appendChild(injectChild);

      ReactDOM.render(<App />, injectChild);

      expect(querySelectorAll('p')).toHaveLength(1);
      expect(querySelectorAll('<Thing1> p')).toHaveLength(1);

      ReactDOM.unmountComponentAtNode(injectChild);
    });
  });
});
