# Cadangan Penaiktarafan UI & UX: Portal W-BINTARA (Sistem Pengurusan Wisma Bintara ATM)

Dokumen ini disediakan untuk memudahkan pembentangan cadangan pemodenan reka bentuk antaramuka (UI) dan pengalaman pengguna (UX) bagi Sistem Pengurusan Wisma Bintara (W-BINTARA) kepada pihak pengurusan atasan (Boss).

---

## 📌 Ringkasan Eksekutif

Sistem W-BINTARA sedia ada (versi JSP lama) mempunyai fungsi teras yang stabil dan selamat, disokong oleh pangkalan data PostgreSQL. Walau bagaimanapun, antaramukanya dibina menggunakan teknologi lama (awal tahun 2000-an) yang mempunyai beberapa kelemahan kritikal:
* **Tidak Responsif Mudah Alih**: Susun atur bingkai (frameset) tegar menyukarkan pengawal di pos kawalan menggunakan telefon pintar atau tablet.
* **Cluttering Visual**: Borang pendaftaran terlalu panjang, padat, dan butang navigasi yang kecil meningkatkan risiko kesilapan input.
* **Tiada Papan Pemuka Eksekutif**: Ketiadaan visualisasi statistik masa nyata menyukarkan pihak pengurusan melihat trend kehadiran pelawat dengan cepat.

Cadangan ini membentangkan **W-BINTARA 2.0 (Modern Admin Dashboard)** — satu transformasi visual penuh di bahagian hadapan (Frontend) **tanpa perlu mengubah sistem logik perniagaan JSP backend atau struktur pangkalan data PostgreSQL sedia ada**. Ini membolehkan naik taraf dilakukan dengan **kos pembangunan yang minima, risiko sifar terhadap kehilangan data, dan kelajuan implementasi yang tinggi**.

---

## 🔄 Banding Beza: Sistem Lama vs Cadangan Baru

| Ciri-Ciri UI/UX | Portal W-BINTARA Sedia Ada (Lama) | Cadangan W-BINTARA 2.0 (Baharu) |
| :--- | :--- | :--- |
| **Susun Atur (Layout)** | Tegar (Fixed-width), reka bentuk jadual bersarang, kelihatan usang. | Papan pemuka moden (SaaS-style dashboard) dengan ruang bernafas dan kad metrik visual. |
| **Mesra Mudah Alih (Responsive)** | Tidak menyokong paparan mudah alih (pengguna perlu *zoom in/out* pada skrin telefon). | **100% Responsif**. Sidebar bertukar menjadi menu *slide-out* pada telefon pintar & tablet. |
| **Borang Pendaftaran** | Borang panjang dengan teks input rapat dan tiada pengesahan (validation) dinamik yang mesra. | Borang dibahagikan kepada 3 seksyen logik dengan pengesahan masa nyata. Bidang input ketenteraan disembunyikan secara dinamik jika pelawat adalah Orang Awam. |
| **Sistem Kod QR** | Menunjukkan imej kod QR statik sahaja tanpa butang tindakan yang jelas. | **Interaktif**. Kod QR dijana secara langsung semasa menaip. Butang khusus untuk memuat turun kod QR (.png) dan mencetak pas fizikal (thermal print). |
| **Paparan Data (Table)** | Senarai rekod yang padat tanpa sistem carian pintar atau paginasi. | Jadual data interaktif lengkap dengan fungsi carian masa nyata, penapisan kategori, dan butang eksport simulasi (Excel/PDF). |
| **Simulasi Imbasan QR** | Tiada modul integrasi atau panduan visual untuk proses pengimbasan. | Ruang simulasi pengimbas QR (Camera Viewfinder) dengan animasi garisan imbasan laser untuk pembuktian konsep (Proof of Concept). |
| **Estetika & Ciri Tambahan** | Skrin kelabu statik. | Reka bentuk modern (Outfit Font), mikro-animasi pada kad/butang, sokongan penuh **Mod Gelap (Dark Mode)**. |

---

## 📺 Demo Video Portal W-BINTARA 2.0

Berikut adalah rakaman video demo interaktif yang menunjukkan navigasi papan pemuka, responsif mudah alih, borang dinamik, dan simulasi pengimbasan Kod QR:

```html
<video width="100%" controls>
  <source src="demo.mp4" type="video/mp4">
  Pelayar anda tidak menyokong elemen video. Sila muat turun fail <a href="demo.mp4">demo.mp4</a> untuk menonton.
</video>
```

---
## 🛠️ Arkitektur & Teknologi Cadangan

Syarahan teknikal reka bentuk semula ini menggunakan pendekatan **"Clean Frontend Override"**:

```
                       [ PEMODENAN FRONTEND SAHAJA ]
┌─────────────────────────────────────────────────────────────────────────┐
│  HTML5 Moden  │  Tailwind/Bootstrap 5  │  JavaScript ES6 (ChartJS, QR)  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ (Menggunakan borang sedia ada / AJAX)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     JSP Backend & PostgreSQL DB                         │
│               (Kekal seperti asal, TIADA PERUBAHAN KOD)                 │
└─────────────────────────────────────────────────────────────────────────┘
```

### Mengapa Pendekatan Ini Diambil?
1. **Kos Minima**: Tiada bayaran lesen perisian baharu atau keperluan membeli pelayan backend tambahan.
2. **Kestabilan Terjamin**: Semua data pendaftaran pelawat tetap diproses oleh kod JSP sedia ada yang telah terbukti stabil.
3. **Penyebaran Pantas (Fast Deployment)**: Hanya melibatkan penggantian fail HTML, CSS, dan JS pada pelayan web.

---

## 🚀 Cara Menjalankan Prototaip Demo

Untuk menunjukkan prototaip interaktif ini kepada pihak pengurusan, anda hanya perlu membuka fail `index.html` pada mana-mana pelayar web moden (Chrome, Safari, Edge, Firefox).

1. Klik fail [index.html](file:///home/maui/github/demo-modern-ui/index.html) dalam folder projek anda.
2. Pelayar akan memaparkan portal papan pemuka interaktif dengan ciri:
   * **Mod Gelap**: Klik ikon bulan di bahagian atas kanan untuk mengaktifkan mod malam.
   * **Daftar Pelawat**: Cuba isi borang pendaftaran dan klik "Jana Kod QR & Simpan". Anda akan melihat kod QR bertukar serta-merta dan mesej kejayaan (SweetAlert) dipaparkan.
   * **Simulasi Pengimbas**: Pergi ke tab "Imbas Kod QR", pilih nama pelawat, dan klik "Simulasikan Imbasan QR" untuk menunjukkan bagaimana pengawal boleh mendaftar keluar pelawat dengan mengimbas pas mereka.
   * **Uji Responsif**: Klik kanan pada halaman, pilih *Inspect*, dan tukar ke mod peranti mudah alih (Mobile view) untuk melihat susun atur responsif.

---
*Disediakan untuk sesi perbincangan naik taraf Sistem Pengurusan Wisma Bintara ATM.*
