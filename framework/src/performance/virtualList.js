// performance/virtualList.js
// List virtualization ("windowing"): for a list of N items, only the
// items currently scrolled into view (plus a small overscan buffer)
// are ever turned into vnodes/DOM nodes. This keeps rendering fast
// regardless of whether the list has 20 items or 20,000 -- combined
// with the core diff engine's keyed diffing, scrolling and editing a
// virtualized list only ever touches the handful of DOM nodes that are
// actually visible.
//
// This is a plain component (props => vnode), so it composes with the
// rest of the framework exactly like any other component.

import { h } from '../core/vnode.js';
import { useState } from '../core/component.js';

/**
 * VirtualList props:
 *  - items: array of data items
 *  - itemHeight: fixed pixel height of each row
 *  - height: visible viewport height in pixels
 *  - overscan: extra rows rendered above/below the viewport (default 5)
 *  - renderItem: (item, index) => vnode
 *  - getKey: (item, index) => string|number, for keyed diffing
 */
export function VirtualList(props) {
  const { items, itemHeight, height, overscan = 5, renderItem, getKey } = props;
  const [scrollTop, setScrollTop] = useState(0);

  const totalHeight = items.length * itemHeight;
  const visibleCount = Math.ceil(height / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(items.length, startIndex + visibleCount + overscan * 2);

  const visibleItems = items.slice(startIndex, endIndex).map((item, i) => {
    const index = startIndex + i;
    const rowVnode = renderItem(item, index);
    return h(
      'div',
      { key: getKey ? getKey(item, index) : index, style: { position: 'absolute', top: `${index * itemHeight}px`, left: '0', right: '0', height: `${itemHeight}px` } },
      [rowVnode]
    );
  });

  return h(
    'div',
    {
      class: 'virtual-list-viewport',
      style: { height: `${height}px`, overflowY: 'auto', position: 'relative' },
      onScroll: { handler: (e) => setScrollTop(e.target.scrollTop) },
    },
    [h('div', { style: { height: `${totalHeight}px`, position: 'relative' } }, visibleItems)]
  );
}
