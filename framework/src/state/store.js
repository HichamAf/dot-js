// state/store.js
// Application state management: a small observable store.
//
// - Storing and updating state: createStore(initialState) returns
//   { getState, setState, subscribe }.
// - Reacting to changes / triggering UI updates: components call
//   store.subscribe(fn) (or use the connect() helper below) so the
//   framework's render scheduler re-renders whenever the state changes.
// - Sharing state across elements/pages: a store is just a plain JS
//   object/module -- import the same store instance anywhere (a page,
//   a sibling component, a different route) to read and write the
//   same shared state, without prop-drilling.

export function createStore(initialState = {}) {
  let state = initialState;
  const listeners = new Set();

  function getState() {
    return state;
  }

  /** Merge a partial update (object), or pass a function (prevState) => partial. */
  function setState(update) {
    const partial = typeof update === 'function' ? update(state) : update;
    state = { ...state, ...partial };
    listeners.forEach((listener) => listener(state));
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener); // unsubscribe
  }

  return { getState, setState, subscribe };
}

/**
 * connectStore(store, scheduleRender) - convenience for wiring a store
 * into the framework's own re-render scheduling. Call once per store
 * per mounted app; every setState afterwards will schedule a re-render
 * automatically, so components just read store.getState() during render.
 */
export function connectStore(store, scheduleRenderFn) {
  return store.subscribe(() => scheduleRenderFn());
}
