import cssSelect from 'css-select';

import adapter from './adapter';
import { generateFullDomMap, generateQueryTree } from './map';
import { setupReactDom } from './global-hook';
export { generatePath } from './generate';

export function querySelector(selector, scope) {
  const roots = generateQueryTree(scope);
  selector = selector.replace(/<(.*?)>/g, '_$1_');
  return cssSelect.selectOne(selector, roots, {
    adapter,
    xmlMode: true
  });
}

export function querySelectorAll(selector, scope) {
  const roots = generateQueryTree(scope);
  selector = selector.replace(/<(.*?)>/g, '_$1_');
  return cssSelect.selectAll(selector, roots, {
    adapter,
    xmlMode: true
  });
}

if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined') {
  Object.values(__REACT_DEVTOOLS_GLOBAL_HOOK__._renderers).forEach(
    setupReactDom
  );

  __REACT_DEVTOOLS_GLOBAL_HOOK__.on('renderer', ({ renderer }) =>
    setupReactDom(renderer)
  );
}
