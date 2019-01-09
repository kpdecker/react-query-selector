export function findFiber(hostNode) {
  return Object.values(window.__REACT_DEVTOOLS_GLOBAL_HOOK__._renderers).reduce(
    (prev, renderer) => prev || renderer.findFiberByHostInstance(hostNode),
    undefined
  );
}

export function fiberRoots() {
  return [].concat(
    ...Object.values(window.__REACT_DEVTOOLS_GLOBAL_HOOK__._fiberRoots).map(
      root => Array.from(root)
    )
  );
}

export let ReactTypeOfWork;

function setupReactDom({ version }) {
  // **********************************************************
  // The section below is copy-pasted from files in React DevTools repo.
  // Keep it in sync, and add version guards if it changes.
  // https://github.com/facebook/react-devtools/blob/master/backend/attachRendererFiber.js
  // **********************************************************
  // The section below is copy-pasted from files in React repo.
  // Keep it in sync, and add version guards if it changes.
  // **********************************************************
  if (version >= '16.6.0') {
    ReactTypeOfWork = {
      FunctionalComponent: 0,
      ClassComponent: 1,
      IndeterminateComponent: 2,
      HostRoot: 3,
      HostPortal: 4,
      HostComponent: 5,
      HostText: 6,
      Fragment: 7,
      Mode: 8,
      ContextConsumer: 9,
      ContextProvider: 10,
      ForwardRef: 11,
      Profiler: 12,
      SuspenseComponent: 13,
      MemoComponent: 14,
      SimpleMemoComponent: 15,
      LazyComponent: 16,
      IncompleteClassComponent: 17,
      CoroutineComponent: -1, // Removed
      CoroutineHandlerPhase: -1, // Removed
      YieldComponent: -1 // Removed
    };
  } else if (version >= '16.4.3') {
    ReactTypeOfWork = {
      FunctionalComponent: 0,
      FunctionalComponentLazy: 1,
      ClassComponent: 2,
      ClassComponentLazy: 3,
      IndeterminateComponent: 4,
      HostRoot: 5,
      HostPortal: 6,
      HostComponent: 7,
      HostText: 8,
      Fragment: 9,
      Mode: 10,
      ContextConsumer: 11,
      ContextProvider: 12,
      ForwardRef: 13,
      ForwardRefLazy: 14,
      Profiler: 15,
      PlaceholderComponent: 16
    };
  } else {
    ReactTypeOfWork = {
      IndeterminateComponent: 0,
      FunctionalComponent: 1,
      FunctionalComponentLazy: -1, // Doesn't exist yet
      ClassComponent: 2,
      ClassComponentLazy: -1, // Doesn't exist yet
      HostRoot: 3,
      HostPortal: 4,
      HostComponent: 5,
      HostText: 6,
      CoroutineComponent: 7,
      CoroutineHandlerPhase: 8,
      YieldComponent: 9,
      Fragment: 10,
      Mode: 11,
      ContextConsumer: 12,
      ContextProvider: 13,
      ForwardRef: 14,
      ForwardRefLazy: -1, // Doesn't exist yet
      Profiler: 15,
      Placeholder: 16
    };
  }
}

if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined') {
  Object.values(__REACT_DEVTOOLS_GLOBAL_HOOK__._renderers).forEach(
    setupReactDom
  );

  __REACT_DEVTOOLS_GLOBAL_HOOK__.on('renderer', ({ renderer }) =>
    setupReactDom(renderer)
  );
} else {
  // Provide our own hook implementation if not running in a devtools environment
  let hook;
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = hook = {
    _renderers: [],
    _fiberRoots: [],
    inject: instance => {
      hook._renderers.push(instance);
      hook._fiberRoots.push([]);
      setupReactDom(instance);
      return hook._renderers.length - 1;
    },
    onCommitFiberRoot: (rendererId, root) => {
      const mountedRoots = hook._fiberRoots[rendererId];
      const current = root.current;
      const isKnownRoot = mountedRoots.includes(root);
      const isUnmounting =
        current.memoizedState == null || current.memoizedState.element == null;
      // Keep track of mounted roots so we can hydrate when DevTools connect.
      if (!isKnownRoot && !isUnmounting) {
        hook._fiberRoots[rendererId].push(root);
      } else if (isKnownRoot && isUnmounting) {
        hook.onCommitFiberUnmount(rendererId, root);
      }
    },
    onCommitFiberUnmount: (rendererId, root) => {
      hook._fiberRoots[rendererId] = hook._fiberRoots[rendererId].filter(
        current => current !== root
      );
    },
    supportsFiber: true
  };
}
