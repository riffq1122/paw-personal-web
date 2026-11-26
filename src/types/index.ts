export type ThemeMode = 'light' | 'dark';
export type TabId = 'profil' | 'jadwal' | 'tugas';
export type TaskStatus = 'Belum Selesai' | 'Selesai';
export type TaskFilter = 'Semua' | TaskStatus;

export interface TaskItem {
  readonly id: number;
  title: string;
  course: string;
  deadline: string;
  status: TaskStatus;
  completed: boolean;
}

export interface AppEnvironmentConfig {
  readonly appName: string;
  readonly appVersion: string;
  readonly isSecretExposed: boolean;
}
