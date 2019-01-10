import './global-hook';

import cssSelect from 'css-select';

import adapter from './adapter';
import { generateQueryTree } from './map';

export { componentDOMNodes } from './map';
export { generatePath } from './generate';

export function querySelector(selector, scope) {
  try {
    const roots = generateQueryTree(scope);
    selector = selector.replace(/<(.*?)>/g, '_$1_');
    const reactComponent = cssSelect.selectOne(selector, roots, {
      adapter,
      xmlMode: true
    });
    if (reactComponent) {
      return reactComponent;
    }
  } catch (err) {
    const toThrow = new Error(`Error Evaluating ${selector}: ${err.message}`);
    toThrow.stack = err.stack;
    throw toThrow;
  }
  try {
    return (scope || document).querySelector(selector) || undefined;
  } catch (err) {
    /* nop */
  }
}

export function querySelectorAll(selector, scope) {
  try {
    const roots = generateQueryTree(scope);
    selector = selector.replace(/<(.*?)>/g, '_$1_');
    const reactComponents = cssSelect.selectAll(selector, roots, {
      adapter,
      xmlMode: true
    });
    if (reactComponents.length) {
      return reactComponents;
    }
  } catch (err) {
    const toThrow = new Error(`Error Evaluating ${selector}: ${err.message}`);
    toThrow.stack = err.stack;
    throw toThrow;
  }

  try {
    return (scope || document).querySelectorAll(selector);
  } catch (err) {
    /* nop */
  }

  return [];
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
