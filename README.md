# react-query-selector

React Component selector engine. Provides a `querySelectorAll` type interface for React components rendered into a particular tree.

## What is this for?

This is designed for development-time implementations only, primarily for react component aware integration testing. It relies on
the React Developer tool hooks as well as non-minimized component names. As such it does not take efforts to be high performance or
production-level page weight. This closely ties to the internal react implementation and may see breakages on react version upgades.

Basically under no circumstances should this be loaded in a production environment!

## Selector Format

Selectors here are a superset of CSS selectors. Most selectors supported by [css-select](https://github.com/fb55/css-select#supported-selectors)
should work. The format is extended slightly to allod for `<ReactComponent>` in the place of a tag selector. This can be treated as if
it were a tag selector and combined with other selectors, i.e. `<MyComponent>[prop=1]` would select components whose JSX representation
matches the following `<MyComponent prop="1" ... />`.

When the final target is a `<ReactComponent>`, the return value will be the instance of the given react component. For DOM nodes the specific
DOM node instance will be returned.

When doing a property selector, all component properties will be run through toString, which could lead to unexpected behavior on objects
passed as properties.

## Examples

```
ReactSelect.querySelector('<MyComponent> div');
```

## API

- `querySelector(selector, [scope]) -> ReactComponent|DOMNode`
  Returns the first react component or dom node matching the given selector. May optionally be scoped to a given react component or DOM node.
- `querySelectorAll(selector, [scope]) -> Array[ReactComponent|DOMNode]`
  Returns all react components or dom nodes matching the given selector. May optionally be scoped to a given react component or DOM node.
- `componentDOMNodes(reactComponent) -> Array[DOMNode]`
  Returns the root-level DOM nodes that a given react component renders to.
- `generatePath(DOMNode) -> string`
  Returns a react selector that can be used to identify the give
- `dumpTree([scope]) -> [string]`
  Returns simplified representation of the entire react render tree or optional sub-`scope`s

## Getting started

`npm run dev` builds the library, then keeps rebuilding it whenever the source files change using [rollup-watch](https://github.com/rollup/rollup-watch).

`npm test` builds the library, then tests it.

## License

[MIT](LICENSE).
