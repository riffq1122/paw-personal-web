type ThemeMode = 'light' | 'dark';
type TabId = 'profil' | 'jadwal' | 'tugas';
type TaskStatus = 'Belum Selesai' | 'Selesai';
type TaskFilter = 'Semua' | TaskStatus;

interface TaskItem {
  readonly id: number;
  title: string;
  course: string;
  deadline: string;
  status: TaskStatus;
  completed: boolean;
}

interface AppEnvironmentConfig {
  readonly appName: string;
  readonly appVersion: string;
  readonly isSecretExposed: boolean;
}

const THEME_STORAGE_KEY: string = 'rifqy-theme-preference';
const TASKS_STORAGE_KEY: string = 'rifqy-kuliah-tasks-v1';
const VALID_TABS: readonly TabId[] = ['profil', 'jadwal', 'tugas'];

const MATA_KULIAH_LIST: readonly string[] = [
  'Pengembangan Aplikasi Web',
  'Manajemen Basis Data',
  'Manajemen Proyek Perangkat Lunak',
  'Pengembangan Aplikasi Mobile',
  'Jaringan Komputer',
  'Interaksi Manusia dan Komputer',
  'Intelegensia Buatan',
  'Kewirausahaan & Etika Bisnis',
];

const INITIAL_TASKS: readonly TaskItem[] = [
  {
    id: 1,
    title: 'Membuat Aplikasi Web CRUD Daftar Tugas Kuliah',
    course: 'Pengembangan Aplikasi Web',
    deadline: '2026-11-20',
    status: 'Selesai',
    completed: true,
  },
  {
    id: 2,
    title: 'Workflow Git & GitHub (5 Commit, 2 Branch, Merge Conflict, PR)',
    course: 'Pengembangan Aplikasi Web',
    deadline: '2026-11-21',
    status: 'Selesai',
    completed: true,
  },
  {
    id: 3,
    title: 'Konfigurasi Proyek Vite, npm Scripts & Semantic Versioning',
    course: 'Pengembangan Aplikasi Web',
    deadline: '2026-11-22',
    status: 'Selesai',
    completed: true,
  },
  {
    id: 4,
    title: 'Implementasi TypeScript: Primitive, Array, Interface, Union & Generics',
    course: 'Pengembangan Aplikasi Web',
    deadline: '2026-11-23',
    status: 'Belum Selesai',
    completed: false,
  },
  {
    id: 5,
    title: 'Konfigurasi Environment Variables (.env & .env.example)',
    course: 'Pengembangan Aplikasi Web',
    deadline: '2026-11-24',
    status: 'Belum Selesai',
    completed: false,
  },
];

// Simple generic helper to read typed JSON values from localStorage.
function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// Simple generic helper to persist typed JSON values to localStorage.
function writeStorage<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

// Simple generic collection filter using a type-safe predicate callback.
function filterItems<T>(items: readonly T[], predicate: (item: T) => boolean): T[] {
  return items.filter(predicate);
}

function getAppConfig(): AppEnvironmentConfig {
  const appName: string = import.meta.env.VITE_APP_NAME?.trim() || 'Portal Tugas Kuliah';
  const appVersion: string = import.meta.env.VITE_APP_VERSION?.trim() || '1.0.0';
  const isSecretExposed: boolean = false;

  return {
    appName,
    appVersion,
    isSecretExposed,
  };
}

function renderEnvironmentBanner(): void {
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

function initThemeToggle(): void {
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

function isValidTabId(value: string): value is TabId {
  return (VALID_TABS as readonly string[]).includes(value);
}

function initTabs(): void {
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

function initScheduleFilter(): void {
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

function formatDeadline(dateString: string): string {
  if (!dateString) return '-';
  const parsed = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return dateString;
  return parsed.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function initTaskPortal(): void {
  const form = document.getElementById('form-tugas') as HTMLFormElement | null;
  const formHeading = document.getElementById('form-tugas-heading');
  const idInput = document.getElementById('tugas-id') as HTMLInputElement | null;
  const titleInput = document.getElementById('tugas-judul') as HTMLInputElement | null;
  const titleError = document.getElementById('tugas-judul-error');
  const courseSelect = document.getElementById('tugas-mk') as HTMLSelectElement | null;
  const deadlineInput = document.getElementById('tugas-deadline') as HTMLInputElement | null;
  const deadlineError = document.getElementById('tugas-deadline-error');
  const statusSelect = document.getElementById('tugas-status') as HTMLSelectElement | null;
  const submitBtn = document.getElementById('btn-simpan-tugas') as HTMLButtonElement | null;
  const cancelEditBtn = document.getElementById('btn-batal-edit') as HTMLButtonElement | null;

  const summaryTotalEl = document.getElementById('task-summary-total');
  const summaryPendingEl = document.getElementById('task-summary-pending');
  const summaryDoneEl = document.getElementById('task-summary-done');

  const searchInput = document.getElementById('cari-tugas') as HTMLInputElement | null;
  const clearSearchBtn = document.getElementById('clear-cari-tugas') as HTMLButtonElement | null;
  const statusButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('.task-filter-pill'));

  const liveAnnouncer = document.getElementById('task-live-announcer');
  const stateLoading = document.getElementById('tugas-state-loading');
  const stateError = document.getElementById('tugas-state-error');
  const stateEmpty = document.getElementById('tugas-state-empty');
  const stateEmptyMsg = document.getElementById('tugas-empty-message');
  const resetEmptyBtn = document.getElementById('reset-filter-tugas') as HTMLButtonElement | null;
  const retryBtn = document.getElementById('retry-tugas') as HTMLButtonElement | null;
  const taskListEl = document.getElementById('daftar-tugas');

  if (!form || !titleInput || !courseSelect || !deadlineInput || !statusSelect || !taskListEl) {
    return;
  }

  const formEl = form;
  const courseSelectEl = courseSelect;
  const titleInputEl = titleInput;
  const deadlineInputEl = deadlineInput;
  const statusSelectEl = statusSelect;
  const taskListContainer = taskListEl;

  // Populate course dropdown options from the real semester 5 course list.
  for (const mk of MATA_KULIAH_LIST) {
    const option = document.createElement('option');
    option.value = mk;
    option.textContent = mk;
    courseSelectEl.appendChild(option);
  }

  let tasks: TaskItem[] = readStorage<TaskItem[]>(TASKS_STORAGE_KEY, [...INITIAL_TASKS]);
  if (!Array.isArray(tasks)) {
    tasks = [...INITIAL_TASKS];
  }

  let activeFilter: TaskFilter = 'Semua';
  let searchQuery: string = '';
  let isEditing: boolean = false;

  function getNextTaskId(): number {
    let maxId: number = 0;
    for (const item of tasks) {
      if (item.id > maxId) {
        maxId = item.id;
      }
    }
    return maxId + 1;
  }

  function showLiveFeedback(message: string): void {
    if (!liveAnnouncer) return;
    liveAnnouncer.hidden = false;
    liveAnnouncer.textContent = '';
    requestAnimationFrame(() => {
      liveAnnouncer.textContent = message;
    });
  }

  function clearValidationErrors(): void {
    if (titleError) titleError.hidden = true;
    if (deadlineError) deadlineError.hidden = true;
    titleInputEl.removeAttribute('aria-invalid');
    deadlineInputEl.removeAttribute('aria-invalid');
  }

  function resetFormToCreateMode(): void {
    isEditing = false;
    if (idInput) idInput.value = '';
    formEl.reset();
    clearValidationErrors();
    courseSelectEl.value = MATA_KULIAH_LIST[0] ?? '';
    statusSelectEl.value = 'Belum Selesai';
    if (formHeading) formHeading.textContent = 'Tambah Tugas Kuliah Baru';
    if (submitBtn) submitBtn.textContent = 'Tambah Tugas';
    if (cancelEditBtn) cancelEditBtn.hidden = true;
  }

  function startEditTask(task: TaskItem): void {
    isEditing = true;
    clearValidationErrors();
    if (idInput) idInput.value = String(task.id);
    titleInputEl.value = task.title;
    courseSelectEl.value = task.course;
    deadlineInputEl.value = task.deadline;
    statusSelectEl.value = task.status;

    if (formHeading) formHeading.textContent = `Edit Tugas #${task.id}`;
    if (submitBtn) submitBtn.textContent = 'Simpan Perubahan';
    if (cancelEditBtn) cancelEditBtn.hidden = false;

    titleInputEl.focus();
  }

  function persistAndRender(feedbackMessage?: string): void {
    const savedOk: boolean = writeStorage<TaskItem[]>(TASKS_STORAGE_KEY, tasks);
    if (!savedOk && stateError) {
      stateError.hidden = false;
    }
    renderTaskList();
    if (feedbackMessage) {
      showLiveFeedback(feedbackMessage);
    }
  }

  function renderTaskList(): void {
    try {
      if (stateLoading) stateLoading.hidden = true;
      if (stateError) stateError.hidden = true;

      const totalTasks: number = tasks.length;
      const doneCount: number = filterItems<TaskItem>(tasks, (t) => t.completed).length;
      const pendingCount: number = totalTasks - doneCount;

      if (summaryTotalEl) summaryTotalEl.textContent = `Total: ${totalTasks} tugas`;
      if (summaryPendingEl) summaryPendingEl.textContent = `Belum Selesai: ${pendingCount}`;
      if (summaryDoneEl) summaryDoneEl.textContent = `Selesai: ${doneCount}`;

      const normalizedQuery: string = searchQuery.trim().toLowerCase();
      if (clearSearchBtn) {
        clearSearchBtn.hidden = normalizedQuery.length === 0;
      }

      const filteredTasks: TaskItem[] = filterItems<TaskItem>(tasks, (item) => {
        const matchesStatus: boolean =
          activeFilter === 'Semua' || item.status === activeFilter;
        const matchesQuery: boolean =
          normalizedQuery === '' ||
          item.title.toLowerCase().includes(normalizedQuery) ||
          item.course.toLowerCase().includes(normalizedQuery);
        return matchesStatus && matchesQuery;
      });

      taskListContainer.replaceChildren();

      if (filteredTasks.length === 0) {
        taskListContainer.hidden = true;
        if (stateEmpty) stateEmpty.hidden = false;
        if (stateEmptyMsg && resetEmptyBtn) {
          if (totalTasks === 0) {
            stateEmptyMsg.textContent =
              'Daftar tugas kuliah saat ini kosong. Tambahkan tugas baru di formulir sebelah kiri atau muat ulang daftar tugas awal.';
            resetEmptyBtn.textContent = 'Muat ulang daftar tugas awal';
          } else {
            stateEmptyMsg.textContent =
              'Tidak ditemukan tugas dengan filter status atau kata kunci pencarian saat ini.';
            resetEmptyBtn.textContent = 'Tampilkan semua tugas';
          }
        }
        return;
      }

      taskListContainer.hidden = false;
      if (stateEmpty) stateEmpty.hidden = true;

      for (const task of filteredTasks) {
        const li = document.createElement('li');
        li.className = `task-card${task.completed ? ' is-completed' : ''}`;

        const metaRow = document.createElement('div');
        metaRow.className = 'task-card-meta';

        const statusBadge = document.createElement('span');
        statusBadge.className = `status-badge ${task.completed ? 'is-done' : 'is-pending'}`;
        statusBadge.textContent = `[${task.status}]`;

        const courseLabel = document.createElement('span');
        courseLabel.className = 'task-course';
        courseLabel.textContent = task.course;

        const deadlineLabel = document.createElement('span');
        deadlineLabel.className = 'task-deadline';
        deadlineLabel.textContent = `Tenggat: ${formatDeadline(task.deadline)}`;

        metaRow.append(statusBadge, courseLabel, deadlineLabel);

        const titleEl = document.createElement('h4');
        titleEl.className = 'task-title';
        titleEl.textContent = task.title;

        const actionsRow = document.createElement('div');
        actionsRow.className = 'task-actions';

        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'btn-secondary btn-task-action';
        toggleBtn.textContent = task.completed ? 'Tandai Belum Selesai' : 'Tandai Selesai';
        toggleBtn.addEventListener('click', () => {
          const nextCompleted: boolean = !task.completed;
          const nextStatus: TaskStatus = nextCompleted ? 'Selesai' : 'Belum Selesai';
          tasks = tasks.map((item) =>
            item.id === task.id
              ? { ...item, completed: nextCompleted, status: nextStatus }
              : item
          );
          persistAndRender(`Status tugas "${task.title}" diubah menjadi ${nextStatus}.`);
        });

        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'btn-secondary btn-task-action';
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => {
          startEditTask(task);
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'btn-danger btn-task-action';
        deleteBtn.textContent = 'Hapus';
        deleteBtn.addEventListener('click', () => {
          tasks = filterItems<TaskItem>(tasks, (item) => item.id !== task.id);
          if (isEditing && idInput?.value === String(task.id)) {
            resetFormToCreateMode();
          }
          persistAndRender(`Tugas "${task.title}" telah dihapus.`);
        });

        actionsRow.append(toggleBtn, editBtn, deleteBtn);
        li.append(metaRow, titleEl, actionsRow);
        taskListContainer.appendChild(li);
      }
    } catch {
      taskListContainer.hidden = true;
      if (stateEmpty) stateEmpty.hidden = true;
      if (stateError) stateError.hidden = false;
    }
  }

  form.addEventListener('submit', (event: SubmitEvent) => {
    event.preventDefault();
    clearValidationErrors();

    const rawTitle: string = titleInputEl.value.trim();
    const selectedCourse: string = courseSelectEl.value || (MATA_KULIAH_LIST[0] ?? 'Umum');
    const selectedDeadline: string = deadlineInputEl.value;
    const selectedStatus: TaskStatus =
      statusSelectEl.value === 'Selesai' ? 'Selesai' : 'Belum Selesai';
    const isDone: boolean = selectedStatus === 'Selesai';

    let firstInvalidField: HTMLElement | null = null;

    if (rawTitle.length < 3) {
      if (titleError) titleError.hidden = false;
      titleInputEl.setAttribute('aria-invalid', 'true');
      firstInvalidField = titleInputEl;
    }

    if (!selectedDeadline) {
      if (deadlineError) deadlineError.hidden = false;
      deadlineInputEl.setAttribute('aria-invalid', 'true');
      if (!firstInvalidField) firstInvalidField = deadlineInputEl;
    }

    if (firstInvalidField) {
      firstInvalidField.focus();
      return;
    }

    const editingId: number = Number(idInput?.value ?? '0');

    if (isEditing && editingId > 0) {
      tasks = tasks.map((item) =>
        item.id === editingId
          ? {
              ...item,
              title: rawTitle,
              course: selectedCourse,
              deadline: selectedDeadline,
              status: selectedStatus,
              completed: isDone,
            }
          : item
      );
      resetFormToCreateMode();
      persistAndRender(`Perubahan tugas "${rawTitle}" berhasil disimpan.`);
    } else {
      const newTask: TaskItem = {
        id: getNextTaskId(),
        title: rawTitle,
        course: selectedCourse,
        deadline: selectedDeadline,
        status: selectedStatus,
        completed: isDone,
      };
      tasks = [newTask, ...tasks];
      resetFormToCreateMode();
      persistAndRender(`Tugas baru "${rawTitle}" berhasil ditambahkan.`);
    }
  });

  cancelEditBtn?.addEventListener('click', () => {
    resetFormToCreateMode();
    showLiveFeedback('Mode edit dibatalkan.');
    titleInputEl.focus();
  });

  for (const btn of statusButtons) {
    btn.addEventListener('click', () => {
      const selected = (btn.getAttribute('data-status-filter') ?? 'Semua') as TaskFilter;
      activeFilter = selected;
      for (const item of statusButtons) {
        const isMatch = item === btn;
        item.classList.toggle('is-active', isMatch);
        item.setAttribute('aria-pressed', String(isMatch));
      }
      renderTaskList();
    });
  }

  searchInput?.addEventListener('input', () => {
    searchQuery = searchInput.value;
    renderTaskList();
  });

  clearSearchBtn?.addEventListener('click', () => {
    searchQuery = '';
    if (searchInput) {
      searchInput.value = '';
      searchInput.focus();
    }
    renderTaskList();
  });

  resetEmptyBtn?.addEventListener('click', () => {
    if (tasks.length === 0) {
      tasks = [...INITIAL_TASKS];
      persistAndRender('Daftar tugas awal berhasil dimuat kembali.');
    } else {
      activeFilter = 'Semua';
      searchQuery = '';
      if (searchInput) searchInput.value = '';
      for (const btn of statusButtons) {
        const isAll = btn.getAttribute('data-status-filter') === 'Semua';
        btn.classList.toggle('is-active', isAll);
        btn.setAttribute('aria-pressed', String(isAll));
      }
      renderTaskList();
    }
  });

  retryBtn?.addEventListener('click', () => {
    tasks = [...INITIAL_TASKS];
    persistAndRender('Daftar tugas dimuat ulang ke kondisi awal.');
  });

  resetFormToCreateMode();
  renderTaskList();
}

renderEnvironmentBanner();
initThemeToggle();
initTabs();
initScheduleFilter();
initTaskPortal();
