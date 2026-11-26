import type { TaskItem } from '../../types';
import { formatDeadline } from '../../utils/date';

export interface TaskCardHandlers {
  onToggleStatus: (task: TaskItem) => void;
  onEdit: (task: TaskItem) => void;
  onDelete: (task: TaskItem) => void;
}

export function createTaskCardElement(task: TaskItem, handlers: TaskCardHandlers): HTMLLIElement {
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
  toggleBtn.addEventListener('click', () => handlers.onToggleStatus(task));

  const editBtn = document.createElement('button');
  editBtn.type = 'button';
  editBtn.className = 'btn-secondary btn-task-action';
  editBtn.textContent = 'Edit';
  editBtn.addEventListener('click', () => handlers.onEdit(task));

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'btn-danger btn-task-action';
  deleteBtn.textContent = 'Hapus';
  deleteBtn.addEventListener('click', () => handlers.onDelete(task));

  actionsRow.append(toggleBtn, editBtn, deleteBtn);
  li.append(metaRow, titleEl, actionsRow);

  return li;
}
