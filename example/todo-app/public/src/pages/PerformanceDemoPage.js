// PerformanceDemoPage.js - proves the framework's performance work:
// renders a 5,000-row list where only the rows scrolled into view are
// ever created as real DOM nodes (see performance/virtualList.js).
// This data is generated in-memory for the demo only; it is separate
// from the real, persisted todos on the other pages.
import { h, useState, VirtualList, link } from '/framework/index.js';

const TOTAL_ITEMS = 5000;
const ITEM_HEIGHT = 32;
const VIEWPORT_HEIGHT = 400;

function generateItems(count) {
  return Array.from({ length: count }, (_, i) => ({ id: i, label: `Synthetic todo #${i + 1}` }));
}

export function PerformanceDemoPage({ router }) {
  const [items] = useState(() => generateItems(TOTAL_ITEMS));
  const [checked, setChecked] = useState(() => new Set());

  const toggle = (id) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const visibleAtOnce = Math.ceil(VIEWPORT_HEIGHT / ITEM_HEIGHT) + 5 * 2;

  return h('main', { class: 'perf-page' }, [
    h('h1', {}, '⚡ Performance demo: list virtualization'),
    h('p', {}, [
      `This list holds ${TOTAL_ITEMS.toLocaleString()} rows, but only about `,
      h('strong', {}, `${visibleAtOnce}`),
      ' are ever real DOM nodes at any moment — the rest exist purely as data until scrolled into view.',
    ]),
    h(VirtualList, {
      items,
      itemHeight: ITEM_HEIGHT,
      height: VIEWPORT_HEIGHT,
      getKey: (item) => item.id,
      renderItem: (item) =>
        h('label', { class: 'perf-row' }, [
          h('input', { type: 'checkbox', checked: checked.has(item.id), onChange: () => toggle(item.id) }),
          ` ${item.label}`,
        ]),
    }),
    h('p', {}, `${checked.size} checked`),
    link(router, { to: '/' }, '← Back to your todos'),
  ]);
}
