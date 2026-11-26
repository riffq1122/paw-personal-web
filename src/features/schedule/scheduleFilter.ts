export function initScheduleFilter(): void {
  const searchInput = document.getElementById('cari-mk') as HTMLInputElement | null;
  const clearSearchBtn = document.getElementById('clear-search') as HTMLButtonElement | null;
  const resetFilterBtn = document.getElementById('reset-filter') as HTMLButtonElement | null;
  const retryBtn = document.getElementById('retry-schedule') as HTMLButtonElement | null;
  const dayButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('.day-pill'));
  const rows = Array.from(document.querySelectorAll<HTMLTableRowElement>('#jadwal-tbody tr'));
  const tableWrapper = document.getElementById('table-wrapper');
  const stateEmpty = document.getElementById('state-empty');
  const stateEmptyMsg = document.getElementById('state-empty-message');
  const stateLoading = document.getElementById('state-loading');
  const stateError = document.getElementById('state-error');
  const totalSksEl = document.getElementById('total-sks');
  const summaryMkEl = document.getElementById('summary-mk');

  if (!tableWrapper || rows.length === 0) return;
  const wrapperEl = tableWrapper;

  let activeDay: string = 'all';
  let searchQuery: string = '';

  function updateScheduleView(): void {
    try {
      if (stateLoading) stateLoading.hidden = true;
      if (stateError) stateError.hidden = true;

      const normalizedQuery = searchQuery.trim().toLowerCase();
      if (clearSearchBtn) {
        clearSearchBtn.hidden = normalizedQuery.length === 0;
      }

      let visibleCount: number = 0;
      let visibleSks: number = 0;

      for (const row of rows) {
        const rowDay = row.getAttribute('data-day') ?? '';
        const rowSks = Number(row.getAttribute('data-sks') ?? '0');
        const rowText = (row.textContent ?? '').toLowerCase();

        const matchesDay: boolean = activeDay === 'all' || rowDay === activeDay;
        const matchesQuery: boolean = normalizedQuery === '' || rowText.includes(normalizedQuery);
        const isVisible: boolean = matchesDay && matchesQuery;

        row.hidden = !isVisible;
        if (isVisible) {
          visibleCount += 1;
          visibleSks += rowSks;
        }
      }

      if (visibleCount === 0) {
        wrapperEl.hidden = true;
        if (stateEmpty) stateEmpty.hidden = false;
        if (stateEmptyMsg) {
          const dayNote = activeDay === 'all' ? 'semua hari' : `hari ${activeDay}`;
          const queryNote = normalizedQuery ? ` dengan kata kunci "${searchQuery.trim()}"` : '';
          stateEmptyMsg.textContent = `Tidak ditemukan jadwal mata kuliah pada ${dayNote}${queryNote}.`;
        }
      } else {
        wrapperEl.hidden = false;
        if (stateEmpty) stateEmpty.hidden = true;
        if (totalSksEl) totalSksEl.textContent = String(visibleSks);
        if (summaryMkEl) {
          summaryMkEl.textContent = `Menampilkan ${visibleCount} dari ${rows.length} mata kuliah`;
        }
      }
    } catch {
      wrapperEl.hidden = true;
      if (stateEmpty) stateEmpty.hidden = true;
      if (stateError) stateError.hidden = false;
    }
  }

  function resetAllFilters(): void {
    activeDay = 'all';
    searchQuery = '';
    if (searchInput) searchInput.value = '';
    for (const btn of dayButtons) {
      const isAll = btn.getAttribute('data-day') === 'all';
      btn.classList.toggle('is-active', isAll);
      btn.setAttribute('aria-pressed', String(isAll));
    }
    updateScheduleView();
  }

  for (const btn of dayButtons) {
    btn.addEventListener('click', () => {
      activeDay = btn.getAttribute('data-day') ?? 'all';
      for (const item of dayButtons) {
        const selected = item === btn;
        item.classList.toggle('is-active', selected);
        item.setAttribute('aria-pressed', String(selected));
      }
      updateScheduleView();
    });
  }

  searchInput?.addEventListener('input', () => {
    searchQuery = searchInput.value;
    updateScheduleView();
  });

  clearSearchBtn?.addEventListener('click', () => {
    searchQuery = '';
    if (searchInput) {
      searchInput.value = '';
      searchInput.focus();
    }
    updateScheduleView();
  });

  resetFilterBtn?.addEventListener('click', () => {
    resetAllFilters();
    searchInput?.focus();
  });

  retryBtn?.addEventListener('click', () => {
    resetAllFilters();
  });
}
