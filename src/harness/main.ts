import { SuperHarness } from './SuperHarness';

function init(): void {
  new SuperHarness();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
