# paw-personal-web

Aplikasi web pribadi dan portal tugas kuliah berbasis Vite dan TypeScript untuk mata kuliah Pengembangan Aplikasi Web (PAW) semester 5.

## Struktur Tab Halaman

1. **01 / Profil & Beranda**: Informasi biodata Rifqy Muhamad Ibrahim, foto profil, institusi, program studi, dan fokus minat bidang data.
2. **02 / Tabel Mata Kuliah**: Menampilkan 8 mata kuliah aktif (total 23 SKS) dengan fitur filter hari (Senin hingga Jumat), pencarian kata kunci, dan tampilan kartu responsif untuk perangkat seluler.
3. **03 / Portal Tugas Kuliah**: Aplikasi CRUD daftar tugas kuliah (tambah, edit, hapus, serta status Belum Selesai / Selesai), integrasi Environment Variables (`.env` / `.env.example`), dan ringkasan spesifikasi TypeScript.

## Environment Variables & Keamanan

Salin `.env.example` menjadi `.env` sebelum menjalankan server lokal:

```dotenv
VITE_APP_NAME=Portal Tugas Kuliah
VITE_APP_VERSION=1.0.0
```

Berkas `.env` telah dicantumkan di `.gitignore` sehingga konfigurasi lokal maupun kunci rahasia tidak ikut terunggah ke GitHub.

## Fitur TypeScript yang Diterapkan

- Primitive types (`string`, `number`, `boolean`)
- Typed Array (`TaskItem[]`, `readonly string[]`)
- Interface (`TaskItem`, `AppEnvironmentConfig`)
- Type alias dan Union type (`ThemeMode`, `TabId`, `TaskStatus`, `TaskFilter`)
- Generics sederhana (`readStorage<T>`, `writeStorage<T>`, `filterItems<T>`)

## Menjalankan Proyek

```bash
npm install
npm run dev
npm run build
```
