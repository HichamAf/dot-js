// router/router.js
// Client-side routing driven by the History API (pushState), so URLs
// are clean (/todos/5, no #). Controls which "page" is shown based on
// the current URL, and lets application code programmatically change
// the URL (e.g. after creating a resource, or in response to a click)
// without a full page reload.

const DYNAMIC_SEGMENT = /^:(.+)$/;

export function createRouter(routes) {
  const listeners = new Set();

  function matchRoute(pathname) {
    for (const route of routes) {
      const params = matchPath(route.path, pathname);
      if (params) return { route, params };
    }
    return { route: routes.find((r) => r.path === '*') || null, params: {} };
  }

  function matchPath(pattern, pathname) {
    const patternParts = pattern.split('/').filter(Boolean);
    const pathParts = pathname.split('/').filter(Boolean);
    if (pattern !== '*' && patternParts.length !== pathParts.length) return null;

    const params = {};
    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      const dynamicMatch = patternPart.match(DYNAMIC_SEGMENT);
      if (dynamicMatch) {
        params[dynamicMatch[1]] = decodeURIComponent(pathParts[i]);
      } else if (patternPart !== pathParts[i]) {
        return null;
      }
    }
    return params;
  }

  function current() {
    return matchRoute(window.location.pathname);
  }

  function notify() {
    const state = current();
    listeners.forEach((listener) => listener(state));
  }

  /** Programmatically change the URL (e.g. after a button click), no full reload. */
  function navigate(path, { replace = false } = {}) {
    if (replace) window.history.replaceState({}, '', path);
    else window.history.pushState({}, '', path);
    notify();
  }

  function start() {
    window.addEventListener('popstate', notify);
    notify();
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return { navigate, start, subscribe, current };
}

/**
 * link(props, children) - build an <a> vnode that navigates via the
 * router instead of triggering a full page reload, while still being
 * a real, accessible <a href> (right-click / open-in-new-tab keep working).
 */
export function link(router, props, children) {
  const { to, ...rest } = props;
  return {
    tag: 'a',
    props: {
      ...rest,
      href: to,
      onClick: {
        handler: (event) => {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
          router.navigate(to);
        },
        preventDefault: true,
      },
    },
    children: (Array.isArray(children) ? children : [children]).map((c) =>
      typeof c === 'object' ? c : { tag: '#text', props: {}, children: [], text: String(c) }
    ),
  };
}
