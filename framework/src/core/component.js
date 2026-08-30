// core/component.js
// Minimal "hooks" system so components can hold their own local state,
// in addition to (or instead of) the shared store from state/.
//
// A component is just a function: (props) => vnode. Instance data
// (hook values) is kept OUTSIDE the vnode tree, in a map keyed by each
// component's stable position in the tree ("path"), so state survives
// across re-renders even though a brand new vnode tree is produced
// every render.

let currentInstance = null;

export function getCurrentInstance() {
  return currentInstance;
}

export function setCurrentInstance(instance) {
  currentInstance = instance;
}

export function createInstance(path) {
  return { path, hooks: [], hookIndex: 0 };
}

/**
 * useState(initial) - local component state.
 * Returns [value, setValue]. Calling setValue schedules a re-render
 * of the whole app (cheap: the virtual DOM diff only touches what
 * actually changed).
 */
export function useState(initialValue) {
  const instance = currentInstance;
  if (!instance) {
    throw new Error('useState() can only be called during component render');
  }
  const index = instance.hookIndex++;
  if (!(index in instance.hooks)) {
    instance.hooks[index] = typeof initialValue === 'function' ? initialValue() : initialValue;
  }
  const setState = (next) => {
    const prev = instance.hooks[index];
    const value = typeof next === 'function' ? next(prev) : next;
    if (value === prev) return;
    instance.hooks[index] = value;
    instance.scheduleRender && instance.scheduleRender();
  };
  return [instance.hooks[index], setState];
}

/**
 * useEffect(fn, deps) - run fn after render when deps change
 * (shallow-compared). No deps = run after every render. Empty array =
 * run once after the first render. Return a cleanup function from fn
 * to run it before the next effect / on unmount.
 */
export function useEffect(fn, deps) {
  const instance = currentInstance;
  if (!instance) {
    throw new Error('useEffect() can only be called during component render');
  }
  const index = instance.hookIndex++;
  const prev = instance.hooks[index];
  const changed = !prev || !deps || deps.some((d, i) => d !== prev.deps[i]);
  instance.hooks[index] = { deps, fn, changed, cleanup: prev ? prev.cleanup : undefined };
}

export function runEffects(instance) {
  instance.hooks.forEach((hook, i) => {
    if (hook && typeof hook.fn === 'function' && hook.changed) {
      if (typeof hook.cleanup === 'function') hook.cleanup();
      const cleanup = hook.fn();
      instance.hooks[i] = { ...hook, cleanup, changed: false };
    }
  });
}
