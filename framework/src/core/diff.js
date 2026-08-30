// core/diff.js
// Resolves a raw vnode tree (which may contain component functions)
// into a pure element/text tree, then diffs that against the previous
// pure tree and patches the real DOM with the minimal set of changes.
// Keyed children diffing means reordering/inserting/removing one item
// in a list (e.g. one todo) does not touch the DOM nodes of the other
// items -- this is the "keyed diffing" performance work.

import { isTextVNode, isComponentVNode, createTextVNode } from './vnode.js';
import { createDomElement, applyProps } from '../dom/dom.js';
import { createInstance, setCurrentInstance, runEffects } from './component.js';

/**
 * Expand component vnodes into plain element/text vnodes.
 * `instances` is the live instance map (path -> instance) for this app;
 * `prevInstances` is the map from the previous render so state carries over.
 */
export function resolve(vnode, path, prevInstances, instances, scheduleRender, effectsQueue) {
  if (vnode == null) return createTextVNode('');

  if (isComponentVNode(vnode)) {
    let instance = prevInstances.get(path);
    if (!instance) instance = createInstance(path);
    instance.scheduleRender = scheduleRender;
    instance.hookIndex = 0;
    instances.set(path, instance);

    setCurrentInstance(instance);
    const rendered = vnode.tag(vnode.props);
    setCurrentInstance(null);

    effectsQueue.push(instance);
    const resolvedChild = resolve(rendered, `${path}/c`, prevInstances, instances, scheduleRender, effectsQueue);
    return resolvedChild;
  }

  if (isTextVNode(vnode)) return vnode;

  const children = vnode.children.map((child, index) => {
    const keyPart = child && child.key !== undefined ? `k:${child.key}` : `i:${index}`;
    return resolve(child, `${path}/${keyPart}`, prevInstances, instances, scheduleRender, effectsQueue);
  });

  return { ...vnode, children };
}

/** Mount a fully-resolved vnode tree into `container` for the first time. */
export function mountTree(vnode, container) {
  const dom = createDomElement(vnode, container);
  container.appendChild(dom);
  return vnode;
}

/** Patch `container`'s single child from oldVnode to newVnode. */
export function patchTree(container, oldVnode, newVnode) {
  patch(container, oldVnode, newVnode, 0, container);
}

function patch(parentDom, oldVnode, newVnode, index, rootContainer) {
  const existingDom = parentDom.childNodes[index];

  if (!oldVnode && newVnode) {
    parentDom.insertBefore(createDomElement(newVnode, rootContainer), existingDom || null);
    return;
  }
  if (oldVnode && !newVnode) {
    if (existingDom) parentDom.removeChild(existingDom);
    return;
  }
  if (!oldVnode && !newVnode) return;

  const oldIsText = isTextVNode(oldVnode);
  const newIsText = isTextVNode(newVnode);

  if (oldIsText && newIsText) {
    if (oldVnode.text !== newVnode.text) existingDom.nodeValue = newVnode.text;
    newVnode.dom = existingDom;
    return;
  }

  if (oldIsText !== newIsText || oldVnode.tag !== newVnode.tag) {
    const freshDom = createDomElement(newVnode, rootContainer);
    parentDom.replaceChild(freshDom, existingDom);
    return;
  }

  // Same tag: patch this element's props, then reconcile children by key.
  const dom = existingDom;
  newVnode.dom = dom;
  applyProps(dom, oldVnode.props, newVnode.props, rootContainer);
  patchChildren(dom, oldVnode.children, newVnode.children, rootContainer);
}

function keyOf(vnode, index) {
  return vnode && vnode.key !== undefined ? `k:${vnode.key}` : `i:${index}`;
}

function patchChildren(parentDom, oldChildren, newChildren, rootContainer) {
  const oldKeyed = new Map();
  oldChildren.forEach((child, i) => oldKeyed.set(keyOf(child, i), { child, domIndex: i }));

  // Build the new DOM order by moving/creating/reusing nodes.
  newChildren.forEach((newChild, newIndex) => {
    const key = keyOf(newChild, newIndex);
    const match = oldKeyed.get(key);

    if (!match) {
      // Brand new node: create and insert at the right position.
      const dom = createDomElement(newChild, rootContainer);
      const refNode = parentDom.childNodes[newIndex] || null;
      parentDom.insertBefore(dom, refNode);
      return;
    }

    oldKeyed.delete(key);
    const currentDom = findDomForOldChild(parentDom, match, oldChildren);
    const refNode = parentDom.childNodes[newIndex] || null;
    if (currentDom !== refNode) {
      parentDom.insertBefore(currentDom, refNode);
    }
    patchNodeInPlace(parentDom, match.child, newChild, currentDom, rootContainer);
  });

  // Remove leftover old nodes that had no matching key in the new list.
  oldKeyed.forEach(({ child }) => {
    if (child.dom && child.dom.parentNode === parentDom) {
      parentDom.removeChild(child.dom);
    }
  });
}

function findDomForOldChild(parentDom, match) {
  return match.child.dom;
}

function patchNodeInPlace(parentDom, oldVnode, newVnode, dom, rootContainer) {
  const oldIsText = isTextVNode(oldVnode);
  const newIsText = isTextVNode(newVnode);

  if (oldIsText && newIsText) {
    if (oldVnode.text !== newVnode.text) dom.nodeValue = newVnode.text;
    newVnode.dom = dom;
    return;
  }
  if (oldIsText !== newIsText || oldVnode.tag !== newVnode.tag) {
    const freshDom = createDomElement(newVnode, rootContainer);
    parentDom.replaceChild(freshDom, dom);
    return;
  }
  newVnode.dom = dom;
  applyProps(dom, oldVnode.props, newVnode.props, rootContainer);
  patchChildren(dom, oldVnode.children, newVnode.children, rootContainer);
}

export { runEffects };
