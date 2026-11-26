import { THEME_STORAGE_KEY } from '../../data/constants';
import type { ThemeMode } from '../../types';

function resolveInitialTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch {
    // Fallback to media preference if storage is blocked.
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: ThemeMode): void {
  document.documentElement.setAttribute('data-theme', theme);
  const toggleBtn = document.getElementById('theme-toggle');
  const toggleText = document.getElementById('theme-toggle-text');

  if (toggleBtn && toggleText) {
    const isDark: boolean = theme === 'dark';
    toggleBtn.setAttribute('aria-pressed', String(isDark));
    toggleBtn.setAttribute(
      'aria-label',
      isDark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'
    );
    toggleText.textContent = isDark ? 'Mode Terang' : 'Mode Gelap';
  }
}

export function initThemeToggle(): void {
  let currentTheme: ThemeMode = resolveInitialTheme();
  applyTheme(currentTheme);

  const toggleBtn = document.getElementById('theme-toggle');
  toggleBtn?.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(currentTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, currentTheme);
    } catch {
      // Ignore storage write errors in private browsing mode.
    }
  });
}
