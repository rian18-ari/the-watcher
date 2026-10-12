<p align="center">
  <img src="resources/icon.png" width="120" height="120" alt="The Watcher Logo" />
</p>

<h1 align="center">The Watcher</h1>

<p align="center">
  <strong>HUD Layar Tepi Layar (Screen-Edge Shelf) Ringan & Zero-Config untuk Memantau Port Dev dan Server Background di Windows.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Windows%2010%20%7C%2011-0078D6?style=flat-square&logo=windows" alt="Windows Platform" />
  <img src="https://img.shields.io/badge/Framework-Electron%20%2B%20React%2018-61DAFB?style=flat-square&logo=react" alt="Electron + React" />
  <img src="https://img.shields.io/badge/Build-Vite%20%2B%20TypeScript-3178C6?style=flat-square&logo=typescript" alt="Vite + TS" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License" />
</p>

---

## 📖 Tentang The Watcher

**The Watcher** adalah utilitas desktop Windows yang melayang secara senyap di tepian paling kiri layar monitor Anda (*Edge-Drop shelf*). Aplikasi ini dirancang untuk memecahkan masalah klasik para developer: **sering lupa port lokal apa saja yang sedang aktif** atau proses server mana yang tertinggal berjalan di background saat terminal sudah ditutup atau di-minimize.

Tanpa perlu konfigurasi atau prefix CLI khusus, The Watcher secara otomatis mendeteksi setiap server lokal (`npm run dev`, `vite`, `next`, `docker`, `python`, `go`, dll) yang mendengarkan (*listening*) pada port lokal (seperti `:3000`, `:5173`, `:8080`, dsb) baik melalui protokol IPv4 maupun IPv6.

Saat kursor mouse Anda didekatkan ke tepian paling kiri layar, panel The Watcher akan meluncur keluar secara mulus dengan animasi *spring physics*, memberikan informasi visual secara *real-time*, akses cepat ke browser, serta fitur pembunuh port dalam 1-klik.

---

## ✨ Fitur Unggulan

- 🔍 **Zero-Config Auto-Discovery**: Tidak membutuhkan prefix CLI tambahan. Jalankan kode Anda seperti biasa di VS Code, Windows Terminal, PowerShell, atau CMD.
- 🟢 **Live Port Status**: Menampilkan nomor port, nama project/script, PID proses, dan lama waktu berjalan (*duration tracker*).
- 🏷️ **Klasifikasi Cerdas ([Dev] vs [System])**: Membedakan proses developer (seperti Node, Python, Docker) dengan proses background bawaan Windows agar proses krusial OS tidak sengaja terhenti.
- 🌐 **1-Click Open Browser**: Langsung buka `http://localhost:<port>` di browser bawaan sistem dengan sekali klik tombol `OPEN ↗`.
- 🛑 **1-Click Port Killer**: Bebaskan port yang bentrok atau hentikan server yang lupa dimatikan dengan tombol `KILL ✕` (`taskkill /F /T`).
- 🪟 **Mekanisme HUD Tepi Layar (Edge-Drop)**: Transparan dan *click-through* (`WS_EX_NOACTIVATE`) saat tertutup sehingga tidak mengganggu kursor atau aktivitas coding Anda.
- 🎛️ **Integrasi System Tray Windows**:
  - Penghitung port aktif secara *live*.
  - Opsi toggle **"Start on Windows Boot"** (otomatis menyala saat laptop dihidupkan).
  - Klik kiri pada ikon tray untuk langsung membuka/menutup panel shelf.
- ⚡ **Super Ringan**: Berjalan tanpa jendela terminal hitam yang mengganggu, dengan konsumsi memori hanya ~45MB RAM.

---

## 💻 Persyaratan Sistem

Sebelum melakukan instalasi, pastikan laptop atau PC Anda telah terpasang:
- **Sistem Operasi**: Windows 10 atau Windows 11 (64-bit).
- **Node.js**: Versi `18.x` atau lebih baru (disarankan versi LTS terbaru). Unduh di [nodejs.org](https://nodejs.org/).
- **Git**: Terpasang di sistem untuk melakukan clone repositori.

---

## 🛠️ Panduan Instalasi Step-by-Step

Ikuti langkah-langkah di bawah ini untuk memasang dan menyiapkan The Watcher di Windows:

### 1. Clone Repositori
Buka terminal (PowerShell atau Command Prompt), lalu jalankan perintah berikut:
```powershell
git clone https://github.com/rian18-ari/the-watcher.git
cd the-watcher
```

### 2. Pasang Dependensi (Dependencies)
Pasang seluruh paket pustaka yang dibutuhkan menggunakan npm:
```powershell
npm install
```

### 3. Kompilasi Proyek (Build)
Lakukan build produksi untuk menghasilkan bundle aplikasi:
```powershell
npm run build
```
*Proses ini akan mengompilasi modul Electron main, preload, dan antarmuka React renderer ke dalam folder `out/`.*

---

## 🚀 Cara Menjalankan Aplikasi

Terdapat beberapa cara praktis untuk menjalankan The Watcher:

### Opsi 1: Melalui Shortcut Desktop / Start Menu (Paling Direkomendasikan)
Setelah instalasi selesai, shortcut aplikasi telah tersedia di sistem Anda:
- **Desktop**: Klik dua kali pada shortcut **The Watcher** di Desktop.
- **Start Menu**: Tekan tombol <kbd>Windows</kbd> pada keyboard, ketik `The Watcher`, lalu tekan <kbd>Enter</kbd>.

### Opsi 2: Menggunakan File Batch Langsung
Di dalam folder proyek, telah disediakan file [TheWatcher.bat](file:///C:/proyek/edgemon/TheWatcher.bat):
- Cukup **klik dua kali** file `TheWatcher.bat`. Aplikasi akan langsung aktif seketika tanpa membuka jendela konsol.

### Opsi 3: Menggunakan File VBScript (Silent Background)
Jalankan file [TheWatcher-Start.vbs](file:///C:/proyek/edgemon/TheWatcher-Start.vbs) untuk eksekusi 100% senyap di latar belakang:
- Klik dua kali file `TheWatcher-Start.vbs`.

### Opsi 4: Melalui Terminal (Command Line)
Jika Anda ingin melihat log pendeteksian port secara langsung di terminal:
```powershell
# Mode Produksi
npm start

# Mode Pengembangan (Hot Reload)
npm run dev
```

---

## 🎯 Panduan Penggunaan

### 1. Menampilkan Shelf (Edge Hover)
- Arahkan kursor mouse Anda hingga **mentok ke tepi paling kiri layar monitor**.
- Shelf The Watcher akan meluncur keluar secara otomatis.
- Geser mouse menjauh dari panel shelf ke tengah layar untuk menutupnya kembali secara otomatis.

### 2. Auto-Reveal via Shortcut
- Jika The Watcher sudah berjalan di background dan Anda mengklik shortcut **The Watcher** di Desktop atau Start Menu, panel shelf di sisi kiri akan **langsung meluncur terbuka otomatis**.

### 3. Menggunakan System Tray (Pojok Kanan Bawah)
The Watcher memiliki ikon mata di area notifikasi taskbar Windows (dekat jam):
- **Klik Kiri**: Membuka atau menutup panel shelf.
- **Klik Kanan**: Membuka menu konteks:
  - 👉 **Open Shelf**: Membuka panel shelf.
  - 🟢 **X active ports**: Menampilkan ringkasan port yang sedang aktif.
  - ☑️ **Start on Windows Boot**: Mengaktifkan/menonaktifkan auto-start saat Windows menyala.
  - 🛑 **Quit The Watcher**: Menutup aplikasi sepenuhnya.

> [!NOTE]
> **Ikon Tray Tidak Terlihat?**  
> Di Windows 10 & 11, aplikasi baru biasanya disembunyikan di menu overflow (tanda panah ke atas `^` di samping jam). Klik panah `^`, lalu drag ikon **The Watcher** keluar ke taskbar utama agar posisinya selalu terlihat.

---

## ⚙️ Mengaktifkan Auto-Start on Windows Boot

Agar The Watcher selalu otomatis menyala di background setiap kali laptop dihidupkan:
1. Klik kanan ikon **The Watcher** di taskbar system tray (dekat jam).
2. Beri centang pada opsi **"Start on Windows Boot"**.
3. Selesai! The Watcher kini siap memantau port secara otomatis setiap kali Anda menyalakan komputer.

---

## ❓ FAQ & Troubleshooting

<details>
<summary><strong>1. Kenapa saat shortcut diklik tidak muncul jendela popup di tengah layar?</strong></summary>
The Watcher sengaja didesain sebagai <em>Screen-Edge HUD</em> yang tersembunyi di luar bidang layar (<code>x: -420px</code>) agar tidak mengganggu fokus saat coding. Begitu dijalankan, aplikasi akan menampilkan notifikasi singkat di pojok kanan bawah, dan Anda cukup mendekatkan kursor mouse ke ujung paling kiri layar untuk membukanya.
</details>

<details>
<summary><strong>2. Apakah The Watcher membaca port IPv6 seperti Vite?</strong></summary>
Ya. The Watcher memindai seluruh socket TCP lokal baik IPv4 (<code>127.0.0.1</code>) maupun IPv6 (<code>[::1]</code>) yang umum digunakan oleh Node 18+, Vite, dan Next.js modern.
</details>

<details>
<summary><strong>3. Apakah aman mematikan proses bertanda [System]?</strong></summary>
Untuk menjaga kestabilan sistem operasi Windows, proses yang teridentifikasi sebagai proses latar belakang sistem (seperti komponen OS) diproteksi secara otomatis (label <code>OS</code>) dan tombol kill dinonaktifkan.
</details>

<details>
<summary><strong>4. Bagaimana cara menghentikan The Watcher sepenuhnya?</strong></summary>
Klik kanan ikon The Watcher di System Tray (dekat jam) lalu pilih <strong>Quit The Watcher</strong>, atau matikan melalui Task Manager (proses <code>electron.exe</code>).
</details>

---

## 🏗️ Tech Stack

- **Desktop Framework**: [Electron](https://www.electronjs.org/)
- **UI Library**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [electron-vite](https://electron-vite.org/) + [Vite](https://vitejs.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Typography**: Plus Jakarta Sans & JetBrains Mono

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah lisensi [MIT](LICENSE).
