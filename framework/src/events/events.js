// events/events.js
// Event delegation system.
//
// Handlers are declared as part of an element's props at render time
// (e.g. h('button', { onClick: fn }, 'Save')) -- never with a raw,
// imperative addEventListener call in application code. Internally,
// the framework attaches exactly ONE real listener per event type on
// the app's root container (delegation), and dispatches to whichever
// element the event actually targets by walking up from event.target.
// This keeps a single "wire" per event type no matter how many
// elements/components use that event, and means listeners never need
// to be re-attached when the DOM is patched.

const listenersByRoot = new WeakMap(); // root -> Set of event types already wired
const HANDLER_KEY = '__dotjsHandlers';

/**
 * Store (or remove) a handler for one event type on a DOM element.
 * Called by the dom module while applying vnode props.
 *
 * A handler may be a plain function, or a config object:
 *   { handler(e) {...}, preventDefault: true, stopPropagation: true }
 */
export function setEventProp(el, eventName, config) {
  if (!el[HANDLER_KEY]) el[HANDLER_KEY] = {};
  if (config === undefined || config === null) {
    delete el[HANDLER_KEY][eventName];
  } else {
    el[HANDLER_KEY][eventName] = config;
  }
}

/** Ensure the root container has one delegated listener for `eventName`. */
export function delegate(root, eventName) {
  let types = listenersByRoot.get(root);
  if (!types) {
    types = new Set();
    listenersByRoot.set(root, types);
  }
  if (types.has(eventName)) return;
  types.add(eventName);

  // A few native events (scroll, focus, blur) don't bubble, so they must
  // be captured on the way down instead of caught on the way up.
  const NON_BUBBLING = new Set(['scroll', 'focus', 'blur']);
  const useCapture = NON_BUBBLING.has(eventName);

  root.addEventListener(eventName, (event) => {
    let node = event.target;
    while (node && node !== root.parentNode) {
      const handlers = node[HANDLER_KEY];
      const config = handlers && handlers[eventName];
      if (config) {
        const handler = typeof config === 'function' ? config : config.handler;
        const opts = typeof config === 'function' ? {} : config;
        if (opts.preventDefault) event.preventDefault();
        handler && handler(event);
        if (opts.stopPropagation) {
          event.stopPropagation();
          break;
        }
      }
      node = node.parentNode;
    }
  }, useCapture);
}

/** Prop name 'onClick' -> DOM event name 'click'. */
export function eventNameFromProp(propName) {
  return propName.slice(2).toLowerCase();
}

export function isEventProp(propName) {
  return propName.startsWith('on') && propName.length > 2;
}
