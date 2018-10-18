import DomUtils from 'domutils';
import { ReactTypeOfWork } from './global-hook';

export function getTypeName(node) {
  let typeName = node.type || '';
  if (typeName.displayName) {
    return `<${typeName.displayName.replace(/[()]/g, '_')}>`;
  } else if (typeof typeName === 'function') {
    return `<${typeName.name || 'Anonymous'}>`;
  } else if (node.tag === ReactTypeOfWork.Fragment) {
    return '<Fragment>';
  }

  return typeName;
}
export function getDisplayName(node) {
  let typeName = node.type || '';
  if (typeName.displayName) {
    return typeName.displayName;
  } else if (typeof typeName === 'function') {
    return typeName.name || 'Anonymous';
  } else if (node.tag === ReactTypeOfWork.Fragment) {
    return 'Fragment';
  }

  return typeName;
}

export function childOfType(node, parent) {
  const typeName = getTypeName(node);
  const ofType = [];
  if (!parent) {
    return;
  }

  let current = parent.child;

  while (current) {
    if (typeName === getTypeName(current)) {
      ofType.push(current);
    }

    current = current.sibling;
  }

  if (ofType.length === 1) {
    return undefined;
  }

  return { ofType, index: ofType.indexOf(node) + 1 };
}

function mapSelectNode(selectNode) {
  const { fiber = {} } = selectNode;

  if (fiber.tag === ReactTypeOfWork.FunctionalComponent) {
    return {
      displayName: selectNode.displayName,
      props: fiber.memoizedProps,
      _reactInternalFiber: fiber
    };
  }
  return fiber.stateNode || selectNode;
}

export default {
  isTag(node) {
    return (
      node.tag === ReactTypeOfWork.FunctionalComponent ||
      node.tag === ReactTypeOfWork.FunctionalComponentLazy ||
      node.tag === ReactTypeOfWork.ClassComponent ||
      node.tag === ReactTypeOfWork.ClassComponentLazy ||
      // || node.tag === ReactTypeOfWork.IndeterminateComponent
      node.tag === ReactTypeOfWork.HostRoot ||
      node.tag === ReactTypeOfWork.HostPortal ||
      node.tag === ReactTypeOfWork.HostComponent ||
      // || node.tag === ReactTypeOfWork.HostText
      node.tag === ReactTypeOfWork.Fragment
    );
    // || node.tag === ReactTypeOfWork.Mode
    // || node.tag === ReactTypeOfWork.ContextConsumer
    // || node.tag === ReactTypeOfWork.ContextProvider
    // || node.tag === ReactTypeOfWork.ForwardRef
    // || node.tag === ReactTypeOfWork.ForwardRefLazy
    // || node.tag === ReactTypeOfWork.Profiler
    // || node.tag === ReactTypeOfWork.PlaceholderComponent
  },
  getName(elem) {
    return elem.typeName;
  },

  hasAttrib(elem, name) {
    const { key, memoizedProps, stateNode } = elem.fiber;
    if (name === 'key') {
      return key != null;
    }
    if (memoizedProps && memoizedProps[name] != null) {
      return true;
    }
    if (elem.fiber.tag === ReactTypeOfWork.HostRoot || stateNode === null) {
      return false;
    }
    if (stateNode.hasAttribute) {
      return stateNode.hasAttribute(name);
    }
    return stateNode.props[name] != null;
  },
  getAttributeValue(elem, name) {
    const { key, memoizedProps, stateNode } = elem.fiber;
    if (name === 'key') {
      return key;
    }
    if (memoizedProps && memoizedProps[name] != null) {
      return `${memoizedProps[name]}`;
    }
    if (elem.fiber.tag === ReactTypeOfWork.HostRoot || stateNode === null) {
      return undefined;
    }
    if (stateNode.getAttribute) {
      return stateNode.getAttribute(name);
    }
    return `${stateNode.props[name]}`;
  },

  getParent(node) {
    return node.parent;
  },
  getChildren(node) {
    return node.children;
  },
  getSiblings(node) {
    return node.parent && node.parent.children;
  },

  /*
     * Get the text content of the node, and its children if it has any.
     */
  getText(node) {
    // string;
    throw new Error('Not Impl');
  },

  removeSubsets: DomUtils.removeSubsets,
  existsOne(test, elems) {
    return !!this.findOne(elems);
  },
  findAll(test, elems) {
    const result = [];
    const stack = elems.slice();

    while (stack.length) {
      let elem = stack.shift();
      if (!this.isTag(elem)) continue;
      if (elem.children && elem.children.length > 0) {
        stack.unshift.apply(stack, elem.children);
      }
      if (test(elem)) result.push(mapSelectNode(elem));
    }
    return result;
  },
  findOne(test, elems) {
    let elem = null;

    for (let i = 0, l = elems.length; i < l && !elem; i++) {
      if (!this.isTag(elems[i])) {
        continue;
      } else if (test(elems[i])) {
        elem = mapSelectNode(elems[i]);
      } else if (elems[i].children.length > 0) {
        elem = this.findOne(test, elems[i].children);
      }
    }

    return elem;
  },

  /**
      The adapter can also optionally include an equals method, if your DOM
      structure needs a custom equality test to compare two objects which refer
      to the same underlying node. If not provided, `css-select` will fall back to
      `a === b`.
    */
  equals(a, b) {
    console.log(a);
    return a.stateNode === b.stateNode;
  }
};
