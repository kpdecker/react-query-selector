import { fiberRoots, ReactTypeOfWork } from './global-hook';
import { getTypeName, getDisplayName, childOfType } from './adapter';

function SelectNode(fiber, parent) {
  this.typeName = getTypeName(fiber).replace(/[<>]/g, '_');
  this.displayName = getDisplayName(fiber);
  this.tag = fiber.tag;
  this.fiber = fiber;
  this.parent = parent;
  this.children = [];
}

export function componentDOMNodes(component) {
  if (!component) {
    return [];
  }
  if (component.cloneNode && component.nodeType) {
    // This is a DOM now (probably...)
    return [component];
  }

  const fiber =
    component._reactInternalFiber ||
    component.fiber ||
    (component.constructor.name === 'FiberNode' && component);
  if (fiber.tag === ReactTypeOfWork.HostComponent) {
    return [fiber.stateNode];
  }

  let children = [];
  let child = fiber.child;

  while (child) {
    children = children.concat(componentDOMNodes(child));
    child = child.sibling;
  }

  return children;
}

export function generateQueryTree(scope) {
  const roots = fiberRoots();

  // Find roots that are not a child of another
  const topRoots = roots.filter(testing => {
    let current = testing.current.stateNode.containerInfo;
    return !roots.find(
      needle => needle !== testing && needle.containerInfo.contains(current)
    );
  });

  return topRoots
    .map(root => {
      if (scope) {
        let scopeDom = componentDOMNodes(scope);
        if (scopeDom.find(scopeDom => scopeDom.contains(root.containerInfo))) {
          // Scope is a superset of this root, remove all filtering
          scope = undefined;
        } else if (
          !scopeDom.find(scopeDom => root.containerInfo.contains(scopeDom))
        ) {
          // DOM Scope and both are unrelated in DOM structure
          return;
        }
      }

      let current = root.current.stateNode.containerInfo;
      const childRoots = roots.filter(needle => {
        return needle !== root && current.contains(needle.containerInfo);
      });
      let treeNode = generateTreeNode(
        scope,
        root.current,
        undefined,
        childRoots
      );

      // Record host components for all parents of the react
      // root, filtering document from the iteration
      while (current && current.parentNode) {
        let currentTree = treeNode;
        treeNode = new SelectNode({
          tag: ReactTypeOfWork.HostComponent,
          type: current.tagName.toLowerCase(),
          stateNode: current
        });
        currentTree.parent = treeNode;
        treeNode.children.push(currentTree);
        current = current.parentNode;
      }

      return treeNode;
    })
    .filter(Boolean);
}

function generateTreeNode(scope, fiber, parent, roots) {
  if (!fiber) {
    return;
  }
  if (scope) {
    if (
      scope._reactInternalFiber !== fiber &&
      scope !== fiber.stateNode &&
      scope.stateNode !== fiber.stateNode
    ) {
      let child = fiber.child;
      while (child) {
        let ret = generateTreeNode(scope, child, parent, roots);
        if (ret) {
          return ret;
        }
        child = child.sibling;
      }
      return undefined;
    }
  }

  let ret = new SelectNode(fiber, parent);
  if (parent) {
    parent.children.push(ret);
  }
  generateTreeNode(undefined, fiber.child, ret, roots);

  if (fiber.tag === ReactTypeOfWork.HostComponent && roots.length) {
    // Check if this is a host of another react rendering context or
    // if we contain the rendering context and non of our children
    // claimed it
    const rootsToClaim = roots.filter(
      child =>
        child.containerInfo === fiber.stateNode ||
        fiber.stateNode.contains(child.containerInfo)
    );
    rootsToClaim.forEach(childRoot => {
      roots.splice(roots.indexOf(childRoot), 1);
      generateTreeNode(undefined, childRoot.current, ret, roots);
    });
  }

  generateTreeNode(undefined, fiber.sibling, parent, roots);

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
