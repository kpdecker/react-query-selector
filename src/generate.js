import { findFiber } from './global-hook';
import { getTypeName } from './adapter';
import { generateFullDomMap } from './map';

export function generatePath(hostNode) {
  // Use the React DOM to generate selector, if possible.
  let path;
  let component = findFiber(hostNode) || hostNode._reactInternalFiber;
  if (component) {
    const domMap = generateFullDomMap();

    let typeName = getTypeName(component);
    let mapped = domMap[typeName].find(
      mapItem => mapItem.node.stateNode === component.stateNode
    );

    path = mapped.path
      .reverse()
      .filter(
        ({ type, selector, ofType }, index) =>
          !index || /^</.test(selector) || ofType
      )
      .map(({ type, selector }) => [selector, domMap[type].length]);

    let singleElement = path.findIndex(
      ([name, count]) => /^</.test(name) && count === 1
    );
    if (singleElement >= 0) {
      path = path.slice(0, singleElement + 1);
    }

    return path
      .map(([name]) => name)
      .reverse()
      .join(' ');
  }
}
