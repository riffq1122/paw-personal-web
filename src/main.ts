import { renderEnvironmentBanner } from './config/env';
import { initScheduleFilter } from './features/schedule/scheduleFilter';
import { initTabs } from './features/tabs/tabs';
import { initTaskPortal } from './features/tasks/taskPortal';
import { initThemeToggle } from './features/theme/themeToggle';

function bootstrapApp(): void {
  renderEnvironmentBanner();
  initThemeToggle();
  initTabs();
  initScheduleFilter();
  initTaskPortal();
}

bootstrapApp();
