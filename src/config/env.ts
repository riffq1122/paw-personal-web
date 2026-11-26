import type { AppEnvironmentConfig } from '../types';

export function getAppConfig(): AppEnvironmentConfig {
  const appName: string = import.meta.env.VITE_APP_NAME?.trim() || 'Portal Tugas Kuliah';
  const appVersion: string = import.meta.env.VITE_APP_VERSION?.trim() || '1.0.0';
  const isSecretExposed: boolean = false;

  return {
    appName,
    appVersion,
    isSecretExposed,
  };
}

export function renderEnvironmentBanner(): void {
  const config = getAppConfig();
  const nameEl = document.getElementById('env-app-name');
  const versionEl = document.getElementById('env-app-version');

  if (nameEl) {
    nameEl.textContent = config.appName;
  }
  if (versionEl) {
    versionEl.textContent = `v${config.appVersion}`;
  }
}
