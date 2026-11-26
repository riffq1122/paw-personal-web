import { VALID_TABS } from '../../data/constants';
import type { TabId } from '../../types';

function isValidTabId(value: string): value is TabId {
  return (VALID_TABS as readonly string[]).includes(value);
}

export function initTabs(): void {
  const tabButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  const tabPanels = Array.from(document.querySelectorAll<HTMLElement>('[role="tabpanel"]'));
  const jumpButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-goto-tab]'));

  if (tabButtons.length === 0 || tabPanels.length === 0) return;

  function activateTab(tabId: TabId, focusTab: boolean = false, updateHash: boolean = true): void {
    for (const btn of tabButtons) {
      const btnTab = btn.getAttribute('data-tab');
      const isSelected: boolean = btnTab === tabId;
      btn.setAttribute('aria-selected', String(isSelected));
      btn.setAttribute('tabindex', isSelected ? '0' : '-1');
      btn.classList.toggle('is-active', isSelected);

      if (isSelected && focusTab) {
        btn.focus();
      }
    }

    for (const panel of tabPanels) {
      const panelMatches: boolean = panel.id === `panel-${tabId}`;
      panel.hidden = !panelMatches;
    }

    if (updateHash) {
      const targetHash = `#${tabId}`;
      if (window.location.hash !== targetHash) {
        history.replaceState(null, '', targetHash);
      }
    }
  }

  for (const btn of tabButtons) {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab') ?? '';
      if (isValidTabId(target)) {
        activateTab(target, false, true);
      }
    });

    btn.addEventListener('keydown', (event: KeyboardEvent) => {
      const currentIndex: number = tabButtons.indexOf(btn);
      let nextIndex: number | null = null;

      if (event.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % tabButtons.length;
      } else if (event.key === 'ArrowLeft') {
        nextIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length;
      } else if (event.key === 'Home') {
        nextIndex = 0;
      } else if (event.key === 'End') {
        nextIndex = tabButtons.length - 1;
      }

      if (nextIndex !== null) {
        event.preventDefault();
        const nextBtn = tabButtons[nextIndex];
        const nextTab = nextBtn?.getAttribute('data-tab') ?? '';
        if (isValidTabId(nextTab)) {
          activateTab(nextTab, true, true);
        }
      }
    });
  }

  for (const jumpBtn of jumpButtons) {
    jumpBtn.addEventListener('click', () => {
      const target = jumpBtn.getAttribute('data-goto-tab') ?? '';
      if (isValidTabId(target)) {
        activateTab(target, false, true);
        const mainEl = document.getElementById('konten-utama');
        mainEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  const initialHash = window.location.hash.replace('#', '');
  if (isValidTabId(initialHash)) {
    activateTab(initialHash, false, false);
  } else {
    activateTab('profil', false, false);
  }

  window.addEventListener('hashchange', () => {
    const hashValue = window.location.hash.replace('#', '');
    if (isValidTabId(hashValue)) {
      activateTab(hashValue, false, false);
    }
  });
}
