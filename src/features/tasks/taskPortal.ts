import { INITIAL_TASKS, MATA_KULIAH_LIST, TASKS_STORAGE_KEY } from '../../data/constants';
import type { TaskFilter, TaskItem, TaskStatus } from '../../types';
import { filterItems } from '../../utils/collection';
import { readStorage, writeStorage } from '../../utils/storage';
import { createTaskCardElement } from './taskCard';

export function initTaskPortal(): void {
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

  function handleToggleStatus(task: TaskItem): void {
    const nextCompleted: boolean = !task.completed;
    const nextStatus: TaskStatus = nextCompleted ? 'Selesai' : 'Belum Selesai';
    tasks = tasks.map((item) =>
      item.id === task.id
        ? { ...item, completed: nextCompleted, status: nextStatus }
        : item
    );
    persistAndRender(`Status tugas "${task.title}" diubah menjadi ${nextStatus}.`);
  }

  function handleDeleteTask(task: TaskItem): void {
    tasks = filterItems<TaskItem>(tasks, (item) => item.id !== task.id);
    if (isEditing && idInput?.value === String(task.id)) {
      resetFormToCreateMode();
    }
    persistAndRender(`Tugas "${task.title}" telah dihapus.`);
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
        const card = createTaskCardElement(task, {
          onToggleStatus: handleToggleStatus,
          onEdit: startEditTask,
          onDelete: handleDeleteTask,
        });
        taskListContainer.appendChild(card);
      }
    } catch {
      taskListContainer.hidden = true;
      if (stateEmpty) stateEmpty.hidden = true;
      if (stateError) stateError.hidden = false;
    }
  }

  formEl.addEventListener('submit', (event: SubmitEvent) => {
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
