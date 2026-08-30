// app.js - application root: wires the router and store into the
// framework's mount(), and picks which page to render for the current URL.
import { h, mount, createRouter } from '/framework/index.js';
import { store } from './store.js';
import { TodoPage } from './pages/TodoPage.js';
import { PerformanceDemoPage } from './pages/PerformanceDemoPage.js';

const router = createRouter([
  { path: '/', name: 'all' },
  { path: '/active', name: 'active' },
  { path: '/completed', name: 'completed' },
  { path: '/performance', name: 'performance' },
  { path: '*', name: 'not-found' },
]);

function App() {
  const { route } = router.current();
  if (route.name === 'performance') return h(PerformanceDemoPage, { router });
  if (route.name === 'not-found') {
    return h('main', {}, [h('h1', {}, '404'), h('p', {}, 'Page not found.')]);
  }
  return h(TodoPage, { router, filterName: route.name });
}

const container = document.getElementById('app');
const app = mount(App, {}, container);

router.subscribe(() => app.rerender());
store.subscribe(() => app.rerender());
router.start();
