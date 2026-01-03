# FormJSON Configuration Documentation

Dokumentasi ini menjelaskan cara membuat file konfigurasi `.json` di dalam folder `formJson/` untuk menghasilkan modul CRUD otomatis menggunakan `scaffold.ts`.

## Struktur Utama JSON

| Properti       | Tipe     | Deskripsi                                             | Contoh                       |
| :------------- | :------- | :---------------------------------------------------- | :--------------------------- |
| `moduleName`   | `string` | Nama modul dalam format PascalCase.                   | `"SalesTransaction"`         |
| `resourceName` | `string` | Nama resource (plural, lowercase) untuk folder & API. | `"sales-transactions"`       |
| `tableName`    | `string` | Nama tabel database (Prisma).                         | `"tm_sales_transaction"`     |
| `title`        | `string` | Judul modul untuk UI.                                 | `"Sales Transaction"`        |
| `route`        | `string` | Path URL halaman admin.                               | `"/admin/sales-transaction"` |
| `classForm`    | `string` | (Opsional) CSS class untuk layout form.               | `"grid grid-cols-2 gap-4"`   |
| `fields`       | `array`  | Daftar field dalam modul.                             | `[...]`                      |

---

## Definisi Field (`fields`)

Setiap objek dalam array `fields` mendukung properti berikut:

### Properti Dasar

- `name` (Wajib): Nama field (snake_case atau camelCase). Digunakan untuk key di database dan form.
- `label` (Wajib): Nama tampilan field di UI.
- `type` (Wajib): Tipe input. (Lihat bagian [Tipe Field](#tipe-field)).
- `required`: `boolean` (default `true`). Jika `false`, field bersifat opsional.
- `defaultValue`: Nilai awal field.
- `readOnly`: `boolean`. Jika `true`, input tidak bisa diedit (biasanya untuk hasil kalkulasi).
- `readOnlyOnEdit`: `boolean`. Jika `true`, field hanya bisa diisi saat data baru (create), tidak bisa diubah saat edit.
- `uppercase`: `boolean` (default `true`). Jika `true`, teks otomatis menjadi huruf besar.

### Properti Khusus

- `options`: `string[]`. Digunakan jika `type: "select"`. Daftar pilihan dropdown.
- `autoCode`: `string`. Pola untuk generate kode otomatis.
  - Format: `{0000}` (urutan), `{YYYY}` (tahun), `{MM}` (bulan), `{DD}` (hari).
  - Contoh: `"TRX-{YYYY}{MM}-{0001}"`.
- `formula`: `string`. Ekspresi JavaScript untuk kalkulasi otomatis antar field.
  - Contoh: `"berat * harga"`.
- `endpoint`: `string`. API endpoint untuk pencarian data (`async-select`) atau autofill pada input `text`.
- `labelField`: `string`. Properti data API yang ditampilkan di label dropdown (untuk `async-select`).
- `valueField`: `string`. Properti data API yang disimpan sebagai nilai (default: `"id"`).

---

## Tipe Field

| Tipe                  | Deskripsi                                                         |
| :-------------------- | :---------------------------------------------------------------- |
| `string` / `text`     | Input teks standar. Mendukung `autoFill` via `endpoint`.          |
| `number`              | Input angka standar.                                              |
| `boolean`             | Input checkbox (Yes/No).                                          |
| `email`               | Input dengan validasi format email.                               |
| `currency` / `rupiah` | Input angka dengan format mata uang Rupiah otomatis.              |
| `gram`                | Input angka desimal (berat). Sangat ketat: hanya angka dan titik. |
| `select`              | Dropdown dengan pilihan statis (menggunakan properti `options`).  |
| `async-select`        | Dropdown pencarian yang mengambil data dari `endpoint` (API).     |

---

## Fitur Lanjutan

### 1. Auto Fill (Lookup)

Digunakan pada `type: "text"` atau `type: "async-select"` untuk mengisi field lain secara otomatis dari data yang ditemukan.

```json
{
  "name": "barcode",
  "type": "text",
  "endpoint": "/api/barangs",
  "autoFill": {
    "namaBarang": "namaBarang", // mengisi field 'namaBarang' dengan property 'namaBarang' dari hasil pencarian
    "harga": "kategoriRel.harga" // nested property didukung
  }
}
```

### 2. Dependency (Cascading Select)

Membuat pilihan dropdown berubah berdasarkan field lain.
Contoh: Memilih Kategori akan memfilter pilihan Jenis.

```json
{
  "name": "jenis",
  "type": "async-select",
  "endpoint": "/api/jenis",
  "dependency": {
    "field": "kategori", // Nama field sumber
    "queryParam": "kodeGroup" // Nama parameter filter di API
  }
}
```

---

## Perintah Perintah

Jalankan perintah ini di terminal:

- **Generate Satu Modul**:
  `npm run generate:module nama-file.json`
- **Generate Semua Modul**:
  `npm run generate:all`
- **Hapus Satu Modul**:
  `npm run delete:module nama-file.json`
- **Hapus Semua Modul**:
  `npm run delete:all`

---

## Contoh Lengkap

```json
{
  "moduleName": "Bank",
  "resourceName": "banks",
  "tableName": "tm_banks",
  "title": "Bank",
  "route": "/admin/banks",
  "fields": [
    { "name": "code", "label": "Bank Code", "type": "text", "uppercase": true },
    { "name": "name", "label": "Bank Name", "type": "text" },
    {
      "name": "category",
      "label": "Category",
      "type": "select",
      "options": ["Local", "International"]
    },
    { "name": "balance", "label": "Initial Balance", "type": "currency" }
  ]
}
```
