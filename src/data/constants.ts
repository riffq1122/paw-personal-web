import type { TabId, TaskItem } from '../types';

export const THEME_STORAGE_KEY: string = 'rifqy-theme-preference';
export const TASKS_STORAGE_KEY: string = 'rifqy-kuliah-tasks-v1';
export const VALID_TABS: readonly TabId[] = ['profil', 'jadwal', 'tugas'];

export const MATA_KULIAH_LIST: readonly string[] = [
  'Pengembangan Aplikasi Web',
  'Manajemen Basis Data',
  'Manajemen Proyek Perangkat Lunak',
  'Pengembangan Aplikasi Mobile',
  'Jaringan Komputer',
  'Interaksi Manusia dan Komputer',
  'Intelegensia Buatan',
  'Kewirausahaan & Etika Bisnis',
];

export const INITIAL_TASKS: readonly TaskItem[] = [
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
