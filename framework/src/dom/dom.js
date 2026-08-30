// dom/dom.js
// Low-level DOM creation/manipulation utilities used internally by the
// core renderer, and exported for anyone who needs a direct escape hatch.
// Application code normally never touches these directly -- it describes
// UI with h() instead -- but they're the "no getElementById needed"
// building blocks underneath.

import { isEventProp, eventNameFromProp, setEventProp, delegate } from '../events/events.js';

const BOOLEAN_ATTRS = new Set(['checked', 'disabled', 'selected', 'readOnly', 'required', 'multiple', 'autofocus']);

/** Create a real DOM element or text node from a resolved (element/text) vnode. */
export function createDomElement(vnode, rootContainer) {
  if (vnode.tag === '#text') {
    const textNode = document.createTextNode(vnode.text);
    vnode.dom = textNode;
    return textNode;
  }
  const el = document.createElement(vnode.tag);
  applyProps(el, {}, vnode.props, rootContainer);
  vnode.children.forEach((child) => {
    el.appendChild(createDomElement(child, rootContainer));
  });
  vnode.dom = el;
  return el;
}

/** Diff old vs new props on a real element and apply only what changed. */
export function applyProps(el, oldProps = {}, newProps = {}, rootContainer) {
  // Remove props that no longer exist
  Object.keys(oldProps).forEach((name) => {
    if (name === 'key') return;
    if (!(name in newProps)) {
      removeProp(el, name);
    }
  });
  // Set new/changed props
  Object.keys(newProps).forEach((name) => {
    if (name === 'key') return;
    if (oldProps[name] !== newProps[name]) {
      setProp(el, name, newProps[name], rootContainer);
    }
  });
}

function setProp(el, name, value, rootContainer) {
  if (isEventProp(name)) {
    const eventName = eventNameFromProp(name);
    setEventProp(el, eventName, value);
    delegate(rootContainer || el, eventName);
    return;
  }
  if (name === 'style' && typeof value === 'object') {
    Object.assign(el.style, value);
    return;
  }
  if (name === 'class' || name === 'className') {
    el.setAttribute('class', value || '');
    return;
  }
  if (name === 'value' && 'value' in el) {
    // keep form controls in sync without losing cursor position unnecessarily
    if (el.value !== value) el.value = value ?? '';
    return;
  }
  if (BOOLEAN_ATTRS.has(name)) {
    el[name] = Boolean(value);
    if (value) el.setAttribute(name, '');
    else el.removeAttribute(name);
    return;
  }
  if (value === false || value === null || value === undefined) {
    el.removeAttribute(name);
    return;
  }
  el.setAttribute(name, value);
}

function removeProp(el, name) {
  if (isEventProp(name)) {
    setEventProp(el, eventNameFromProp(name), undefined);
    return;
  }
  if (name === 'style') {
    el.removeAttribute('style');
    return;
  }
  if (BOOLEAN_ATTRS.has(name)) {
    el[name] = false;
    el.removeAttribute(name);
    return;
  }
  el.removeAttribute(name);
}

/** Convenience helper: read current values of named form fields from a <form> element. */
export function readForm(formEl, fields) {
  const data = {};
  fields.forEach((name) => {
    const field = formEl.elements.namedItem(name);
    if (field) data[name] = field.value;
  });
  return data;
}
