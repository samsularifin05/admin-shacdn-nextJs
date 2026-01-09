# FormJSON Configuration Documentation

Dokumentasi ini menjelaskan cara membuat file konfigurasi `.json` di dalam folder `formJson/` untuk menghasilkan modul CRUD otomatis menggunakan `scaffold.ts`.

## Struktur Utama JSON

| Properti       | Tipe      | Deskripsi                                                    | Contoh                       |
| :------------- | :-------- | :----------------------------------------------------------- | :--------------------------- |
| `moduleName`   | `string`  | Nama modul dalam format PascalCase.                          | `"SalesTransaction"`         |
| `resourceName` | `string`  | Nama resource (plural, lowercase) untuk folder & API.        | `"sales-transactions"`       |
| `tableName`    | `string`  | Nama tabel database (Prisma).                                | `"tm_sales_transaction"`     |
| `title`        | `string`  | Judul modul untuk UI.                                        | `"Sales Transaction"`        |
| `route`        | `string`  | Path URL halaman admin.                                      | `"/admin/sales-transaction"` |
| `classForm`    | `string`  | (Opsional) CSS class untuk layout form.                      | `"grid grid-cols-2 gap-4"`   |
| `printable`    | `boolean` | (Opsional) Aktifkan fitur cetak struk otomatis & reprint.    | `true`                       |
| `fields`       | `array`   | Daftar field dalam modul.                                    | `[...]`                      |
| `stockLogic`   | `object`  | (Opsional) Aturan otomatisasi stok (pengurangan/penambahan). | `{...}`                      |

---

## Definisi Field (`fields`)

Every object within the array `fields` supports the following properties:

### Properti Dasar

- `name` (Wajib): Nama field (snake_case atau camelCase). Digunakan untuk key di database dan form.
- `label` (Wajib): Nama tampilan field di UI.
- `type` (Wajib): Tipe input. (Lihat bagian [Tipe Field](#tipe-field)).
- `required`: `boolean` (default `true`). Jika `false`, field bersifat opsional.
- `defaultValue`: Nilai awal field. Bisa berupa string statis atau kata kunci khusus:
  - `"today"`: Mengisi otomatis dengan tanggal hari ini (YYYY-MM-DD).
  - `"CASH"`: Contoh nilai default teks.
  - `0`: Contoh nilai default angka.
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
- `relatedTable`: `string`. Nama tabel referensi di database (untuk `async-select`). Wajib diisi jika ingin membuat relasi formal di Prisma (penting untuk lookup nama barang saat print/detail).

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
| `detail`              | Tipe khusus untuk tabel item/keranjang (Master-Detail).           |
| `file`                | Input upload file otomatis. Jalur file simpan di database.        |

---

## Properti Tambahan Tipe File (`file`)

Jika menggunakan `type: "file"`, Anda dapat menambahkan properti berikut:

- **`uploadDir`**: (Opsional, default: `"uploads"`) Nama folder di dalam `public/` tempat file akan disimpan.
  Contoh: `"uploadDir": "documents"` akan menyimpan file di `public/documents/`.

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

### 3. Master-Detail (Sub-Form / Cart)

Digunakan untuk membuat transaksi dengan banyak item (seperti keranjang belanja).

```json
{
  "name": "items",
  "label": "Daftar Barang",
  "type": "detail",
  "detailFields": [
    {
      "name": "barangId",
      "label": "Barang",
      "type": "async-select",
      "relatedTable": "tm_barang",
      "endpoint": "/api/barangs",
      "autoFill": { "harga": "hargaJual" }
    },
    { "name": "qty", "label": "Qty", "type": "number" },
    {
      "name": "subtotal",
      "label": "Subtotal",
      "type": "rupiah",
      "readOnly": true
    }
  ]
}
```

- **`detailFields`**: Daftar field yang ada di dalam baris keranjang.
- **Kalkulasi**: Jika ada field bernama `subtotal` dan `qty` & `harga`, sistem akan menghitung subtotal secara otomatis.
- **Grand Total**: Jika field utama memiliki nama `totalAmount`, maka total dari seluruh subtotal akan otomatis dijumlahkan ke sana.

### 4. Stock Logic

Otomatis mengurangi atau menambah stok di tabel target saat transaksi disimpan/diupdate.

```json
"stockLogic": {
  "type": "reduce", // atau "increase"
  "targetTable": "tm_barang", // Tabel database target
  "identifierField": "barangId", // Kolom di tabel detail yang merujuk ke ID target
  "stockField": "stock", // Kolom stok di tabel target
  "quantityField": "qty" // Kolom jumlah di tabel detail yang digunakan untuk hitung
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
  "moduleName": "SalesTransaction",
  "resourceName": "sales-transactions",
  "tableName": "tm_sales_transaction",
  "title": "Sales Transaction",
  "route": "/admin/sales-transaction",
  "printable": true,
  "stockLogic": {
    "type": "reduce",
    "targetTable": "tm_barang",
    "identifierField": "barangId",
    "stockField": "stock",
    "quantityField": "qty"
  },
  "fields": [
    {
      "name": "transactionCode",
      "label": "No. Transaksi",
      "type": "text",
      "autoCode": "SLS-{YYYYMMDD}-{0001}",
      "readOnly": true
    },
    {
      "name": "transactionDate",
      "label": "Tanggal",
      "type": "string",
      "defaultValue": "today"
    },
    {
      "name": "items",
      "type": "detail",
      "detailFields": [
        {
          "name": "barangId",
          "type": "async-select",
          "relatedTable": "tm_barang",
          "endpoint": "/api/barangs"
        },
        { "name": "qty", "type": "number" }
      ]
    }
  ]
}
```
