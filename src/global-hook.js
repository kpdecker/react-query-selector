export function findFiber(hostNode) {
  return (
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ &&
    Object.values(window.__REACT_DEVTOOLS_GLOBAL_HOOK__._renderers).reduce(
      (prev, renderer) => prev || renderer.findFiberByHostInstance(hostNode),
      undefined
    )
  );
}

export function fiberRoots() {
  if (!window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    return [];
  }

  return [].concat(
    ...Object.values(window.__REACT_DEVTOOLS_GLOBAL_HOOK__._fiberRoots).map(
      root => Array.from(root)
    )
  );
}

export let ReactTypeOfWork;

export function setupReactDom({ version }) {
  // **********************************************************
  // The section below is copy-pasted from files in React DevTools repo.
  // Keep it in sync, and add version guards if it changes.
  // https://github.com/facebook/react-devtools/blob/69d137c7feb95c1559ffe54045d518fb86e19e05/backend/attachRendererFiber.js#L28
  // **********************************************************
  // The section below is copy-pasted from files in React repo.
  // Keep it in sync, and add version guards if it changes.
  // **********************************************************
  if (version >= '16.4.3') {
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
