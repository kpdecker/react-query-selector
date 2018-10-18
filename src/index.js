import './global-hook';

import cssSelect from 'css-select';

import adapter from './adapter';
import { generateQueryTree } from './map';

export { componentDOMNodes } from './map';
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

export function dumpTree(scope) {
  function printNode(node, depth) {
    const padding = '  '.repeat(depth);
    if (node.children.length) {
      return `${padding}<${node.displayName}>
${node.children.map(child => printNode(child, depth + 1)).join('')}
${padding}</${node.displayName}>
`;
    } else {
      return `${padding}<${node.displayName}/>\n`;
    }
  }
  return generateQueryTree(scope).map(root => {
    return printNode(root, 0);
  });
}
