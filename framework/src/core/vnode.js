// core/vnode.js
// A vnode is a plain JS object describing one element:
//   { tag, props, children, key }
// `tag` is either a string (a real DOM tag name, e.g. 'div') or a
// component function (props => vnode). Text is represented as a
// primitive (string/number) directly inside a children array.

export const TEXT_NODE = '#text';

/**
 * h(tag, props, children) - create a virtual node.
 * This is the framework's core primitive for describing UI in JavaScript.
 *
 * @param {string|Function} tag - DOM tag name ('div', 'button', ...) or a component function.
 * @param {object} [props] - attributes, styles, and event handlers (onClick, onInput, ...).
 * @param {Array|string|number} [children] - nested vnodes, strings/numbers, or arrays thereof.
 */
export function h(tag, props = {}, children = []) {
  const flatChildren = Array.isArray(children) ? children.flat(Infinity) : [children];
  return {
    tag,
    props: props || {},
    children: flatChildren
      .filter((c) => c !== null && c !== undefined && c !== false)
      .map((c) => (typeof c === 'object' ? c : createTextVNode(c))),
    key: props ? props.key : undefined,
  };
}

export function createTextVNode(text) {
  return { tag: TEXT_NODE, props: {}, children: [], text: String(text) };
}

export function isTextVNode(vnode) {
  return vnode.tag === TEXT_NODE;
}

export function isComponentVNode(vnode) {
  return typeof vnode.tag === 'function';
}
