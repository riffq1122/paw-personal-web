# paw-personal-web

Aplikasi web pribadi, tabel jadwal perkuliahan semester 5, dan portal tugas kuliah berbasis Vite dan TypeScript milik Rifqy Muhamad Ibrahim (Teknik Informatika, UIN Sunan Gunung Djati Bandung).

## Struktur Tab Halaman

1. **01 / Profil & Beranda**: Informasi biodata Rifqy Muhamad Ibrahim, foto profil, institusi, program studi, dan fokus minat bidang data.
2. **02 / Tabel Mata Kuliah**: Menampilkan 8 mata kuliah aktif (total 23 SKS) dengan fitur filter hari (Senin hingga Jumat), pencarian kata kunci, dan tampilan kartu responsif untuk perangkat seluler.
3. **03 / Portal Tugas Kuliah**: Aplikasi CRUD daftar tugas kuliah (tambah, edit, hapus, serta status Belum Selesai / Selesai), integrasi Environment Variables (`.env` / `.env.example`), dan ringkasan teknis proyek.

## Struktur Folder Kode (`src/`)

Kode sumber TypeScript dipisahkan menjadi beberapa modul berdasarkan tanggung jawab (*separation of concerns*) agar mudah dikelola dan dikembangkan:

```text
src/
├── main.ts                         # Entry point aplikasi (bootstrap seluruh modul)
├── style.css                       # Stylesheet utama Editorial / Swiss-clean
├── vite-env.d.ts                   # Deklarasi tipe ImportMetaEnv untuk Vite
├── types/
│   └── index.ts                    # Definisi tipe & interface TypeScript bersama
├── config/
│   └── env.ts                      # Pembacaan VITE_APP_NAME & VITE_APP_VERSION + render banner
├── data/
│   └── constants.ts                # Kunci localStorage, daftar tab, 8 mata kuliah, dan data tugas awal
├── utils/
│   ├── storage.ts                  # Helper generics localStorage (readStorage<T>, writeStorage<T>)
│   ├── collection.ts               # Helper generics filter koleksi (filterItems<T>)
│   └── date.ts                     # Pemformatan tanggal tenggat (formatDeadline)
└── features/
    ├── theme/
    │   └── themeToggle.ts          # Logika sakelar tema Terang/Gelap
    ├── tabs/
    │   └── tabs.ts                 # Navigasi ARIA Tabs, keyboard arrows, & sinkronisasi URL hash
    ├── schedule/
    │   └── scheduleFilter.ts       # Filter hari, pencarian jadwal, & kalkulasi SKS otomatis
    └── tasks/
        ├── taskCard.ts             # Render elemen kartu tugas (toggle status, edit, hapus)
        └── taskPortal.ts           # Manajemen state CRUD Portal Tugas Kuliah & validasi form
```

---

## Penjelasan Teknologi yang Digunakan di Website Pribadi

### 1. Git dan GitHub
- **Git** mencatat setiap perubahan kode secara terstruktur melalui commit, branch fitur (`feat/jadwal-kuliah`, `feat/portal-tugas`), penggabungan branch (`merge`), serta penyelesaian *merge conflict*.
- **GitHub** berfungsi sebagai repositori jarak jauh (*remote repository*) tempat menyinkronkan kode (`push` / `pull`) dan mengelola kolaborasi melalui *Pull Request*.
- Berkas `.gitignore` memastikan direktori `node_modules/`, hasil build `dist/`, dan berkas rahasia `.env` tidak ikut terunggah ke repositori publik.

### 2. npm (Node Package Manager)
- Mengelola pustaka proyek pada [package.json](package.json) beserta kunci versi persisnya di `package-lock.json` dengan standar *Semantic Versioning* (`MAJOR.MINOR.PATCH`).
- Memisahkan paket `dependencies` (kebutuhan runtime aplikasi) dan `devDependencies` (`typescript`, `vite` yang hanya dipakai saat pengembangan dan proses build).
- Menyediakan *npm scripts* (`npm run dev`, `npm run build`, `npm run preview`) agar perintah pengembangan dan build berjalan konsisten.

### 3. TypeScript
- Memberikan pemeriksaan tipe statis (*static type-checking*) sehingga kesalahan tipe data terdeteksi sebelum kode dijalankan di browser.
- Fitur TypeScript yang diterapkan pada modul `src/` (`src/types/index.ts`, `src/utils/`, `src/features/`, dan `src/vite-env.d.ts`):
  - **Primitive types**: `string`, `number`, `boolean`
  - **Typed Array**: `TaskItem[]`, `readonly string[]`
  - **Interface**: `TaskItem`, `AppEnvironmentConfig`, `ImportMetaEnv`
  - **Type alias & Union type**: `ThemeMode`, `TabId`, `TaskStatus`, `TaskFilter`
  - **Generics sederhana**: `readStorage<T>`, `writeStorage<T>`, `filterItems<T>`

### 4. Vite dan Peran Compiler, Transpiler, serta Bundler
Karena browser hanya mengeksekusi JavaScript standar, HTML, dan CSS, proyek ini mengandalkan tiga tahapan pemrosesan melalui script `npm run build` (`tsc && vite build`):
- **Compiler (`tsc` / TypeScript Compiler)**: Memeriksa kebenaran tipe data seluruh berkas `.ts` (`noEmit: true`) tanpa menghasilkan file keluaran jika masih ada kesalahan sintaks atau tipe.
- **Transpiler (Vite + esbuild/oxc)**: Mengubah (*transpile*) kode TypeScript menjadi JavaScript murni dengan menghapus anotasi tipe serta menyesuaikan fitur sintaks modern agar kompatibel dengan browser target.
- **Bundler (Vite + Rollup/Rolldown)**: Menggabungkan seluruh modul JavaScript, CSS, gambar, dan aset dari `src/` serta `public/` menjadi berkas produksi yang ringkas, ter-minifikasi, dan siap deploy di folder `dist/`. Saat mode pengembangan (`npm run dev`), Vite menyajikan modul ES secara instan dengan *Hot Module Replacement* (HMR).

### 5. Environment Variables
- Berkas `.env` menyimpan konfigurasi aplikasi publik non-rahasia (`VITE_APP_NAME=Portal Tugas Kuliah` dan `VITE_APP_VERSION=1.0.0`) yang dibaca di sisi klien melalui `import.meta.env`.
- Berkas `.env.example` menyediakan templat nama variabel tanpa nilai sensitif sebagai panduan bagi pengembang lain.
- Password, token privat, dan API key rahasia **tidak boleh** diberi prefix `VITE_` atau disimpan di `.env` sisi klien maupun diunggah ke GitHub karena seluruh nilai berawalan `VITE_` akan ikut terbawa ke bundle JavaScript produksi.

---

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

1. Salin templat environment:
   ```bash
   cp .env.example .env
   ```
2. Pasang paket dan jalankan server pengembangan:
   ```bash
   npm install
   npm run dev
   ```
3. Lakukan pemeriksaan tipe dan build produksi:
   ```bash
   npm run build
   npm run preview
   ```
