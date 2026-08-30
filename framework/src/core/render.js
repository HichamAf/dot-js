// core/render.js
// The application entry point: mount(rootComponent, props, container).
// Owns the render loop: resolve component tree -> diff against last
// tree -> patch the real DOM -> run effects. Renders are batched onto
// a microtask so many state changes in the same tick produce one
// screen update instead of many.

import { resolve, mountTree, patchTree, runEffects } from './diff.js';

export function mount(rootComponent, initialProps, container) {
  let instances = new Map();
  let currentTree = null;
  let renderScheduled = false;

  function scheduleRender() {
    if (renderScheduled) return;
    renderScheduled = true;
    queueMicrotask(runRender);
  }

  function runRender() {
    renderScheduled = false;
    const prevInstances = instances;
    instances = new Map();
    const effectsQueue = [];

    const rawVnode = { tag: rootComponent, props: initialProps || {}, children: [] };
    const resolved = resolve(rawVnode, 'root', prevInstances, instances, scheduleRender, effectsQueue);

    if (!currentTree) {
      mountTree(resolved, container);
    } else {
      patchTree(container, currentTree, resolved);
    }
    currentTree = resolved;

    effectsQueue.forEach(runEffects);
  }

  runRender();

  return {
    /** Force an immediate synchronous re-render (rarely needed). */
    rerender: runRender,
    /** Unmount the app and clear the container. */
    unmount() {
      container.innerHTML = '';
      currentTree = null;
      instances = new Map();
    },
  };
}
