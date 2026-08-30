// Filters.js - navigation built with the router's link() helper:
// real <a href> elements that update the URL via pushState instead of
// reloading the page.
import { h, link } from '/framework/index.js';

export function Filters({ router, current }) {
  const tabs = [
    { to: '/', name: 'all', label: 'All' },
    { to: '/active', name: 'active', label: 'Active' },
    { to: '/completed', name: 'completed', label: 'Completed' },
  ];
  return h(
    'nav',
    { class: 'filters', 'aria-label': 'Filter todos' },
    tabs.map((tab) =>
      link(router, { to: tab.to, class: `filter-link${current === tab.name ? ' active' : ''}`, key: tab.name }, tab.label)
    )
  );
}
