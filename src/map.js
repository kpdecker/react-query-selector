import { fiberRoots } from './global-hook';
import { getTypeName, childOfType } from './adapter';

function SelectNode(fiber, parent) {
  this.typeName = getTypeName(fiber).replace(/[<>]/g, '_');
  this.tag = fiber.tag;
  this.fiber = fiber;
  this.parent = parent;
  this.children = [];
}

export function generateQueryTree(scope) {
  return fiberRoots()
    .map(root => {
      if (scope) {
        let scopeDom;
        if (scope._reactInternalFiber) {
          scopeDom = scope._reactInternalFiber.return.stateNode;
        } else if (scope.contains) {
          scopeDom = scope;
        }
        if (scopeDom.contains(root.containerInfo)) {
          scope = undefined;
        } else if (!root.containerInfo.contains(scopeDom)) {
          // DOM Scope and both are unrelated in DOM structure
          return;
        }
      }
      return generateTreeNode(scope, root.current);
    })
    .filter(Boolean);
}

function generateTreeNode(scope, fiber, parent) {
  if (!fiber) {
    return;
  }
  if (scope) {
    if (
      scope !== fiber.stateNode &&
      scope !== (fiber.return && fiber.return.stateNode) &&
      scope.stateNode !== fiber.stateNode &&
      scope.stateNode !== (fiber.return && fiber.return.stateNode)
    ) {
      return generateTreeNode(scope, fiber.child, parent);
    }
  }
  let ret = new SelectNode(fiber, parent);
  if (parent) {
    parent.children.push(ret);
  }
  generateTreeNode(undefined, fiber.child, ret);
  generateTreeNode(undefined, fiber.sibling, parent);

  return ret;
}

export function generateFullDomMap() {
  let domMap = {
    totalNodes: 0
  };
  fiberRoots().map(root => {
    generateDomMap(root.current, [], domMap);
  });
  return domMap;
}

function generateDomMap(node, path, into, parent) {
  let typeName = getTypeName(node);
  const ofType = childOfType(node, parent);

  let instanceSelector = '';
  if (node.key) {
    instanceSelector = `[key=${JSON.stringify(node.key)}]`;
  } else if (ofType) {
    instanceSelector = `:nth-of-type(${ofType.index})`;
  }

  const thisPath = typeName
    ? path.concat({
        type: typeName,
        ofType: ofType,
        selector: `${typeName}${instanceSelector}`
      })
    : path;
  if (typeName) {
    if (!into[typeName]) {
      into[typeName] = [];
    }
    into[typeName].push({
      node,
      parent,
      path: thisPath
    });
    into.totalNodes += 1;
  }

  if (node.child) {
    generateDomMap(node.child, thisPath, into, node);
  }
  if (node.sibling) {
    generateDomMap(node.sibling, path, into, parent);
  }
  return into;
}
