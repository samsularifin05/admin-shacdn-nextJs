# Formula Field Documentation

## Fitur Formula Field

Formula field adalah field yang otomatis menghitung nilai berdasarkan formula matematika yang Anda definisikan. Field ini menggunakan library **mathjs** untuk evaluasi ekspresi matematika.

## Cara Menggunakan

### 1. Tambahkan Field Formula di CMS Builder

1. Buka **CMS Builder** → **New Module** atau edit module yang sudah ada
2. Klik **Add Field** → Pilih **Formula**
3. Isi konfigurasi:
   - **Name**: nama field (e.g., `total`)
   - **Label**: label yang ditampilkan (e.g., "Total Harga")
   - **Formula Expression**: formula matematika (e.g., `qty * price`)
   - **Decimal Places**: jumlah angka desimal (default: 2)
   - **Prefix**: awalan tampilan (e.g., "Rp")
   - **Suffix**: akhiran tampilan (e.g., "kg", "m²")

### 2. Menulis Formula

#### Syntax Dasar

Formula dapat menggunakan nama field langsung atau dengan kurung kurawal:

```javascript
// Opsi 1: Langsung nama field
qty * price

// Opsi 2: Dengan kurung kurawal
{qty} * {price}

// Keduanya valid dan menghasilkan hasil yang sama
```

#### Operator yang Didukung

- **Aritmatika**: `+`, `-`, `*`, `/`, `^` (pangkat)
- **Perbandingan**: `>`, `<`, `>=`, `<=`, `==`, `!=`
- **Logika**: `and`, `or`, `not`
- **Fungsi**: `abs()`, `round()`, `ceil()`, `floor()`, `sqrt()`, `max()`, `min()`, dll

#### Contoh Formula

**1. Perhitungan Sederhana**

```javascript
// Total = Quantity × Price
qty *
  price(
    // Subtotal dengan diskon
    qty * price,
  ) -
  discount;

// Harga setelah pajak (PPN 11%)
price * 1.11;
```

**2. Formula dengan Fungsi**

```javascript
// Maksimum antara dua nilai
max(price1, price2);

// Pembulatan ke atas
ceil(qty / packSize);

// Akar kuadrat
sqrt(area);
```

**3. Formula Kompleks**

```javascript
// Harga total dengan diskon bertingkat
qty * price * (1 - discount / 100) * 1.11;

// Luas lingkaran (πr²)
(3.14159 * radius) ^
  (2(
    // Berat total dengan konversi
    qty * unitWeight,
  ) /
    1000);
```

**4. Conditional Formula**

```javascript
// If-else dengan ternary
qty >= 100 ? price * 0.9 : price;

// Diskon progresif
qty >= 100 ? (qty >= 500 ? price * 0.8 : price * 0.9) : price;
```

### 3. Field yang Direferensi

Formula akan otomatis mengambil nilai dari field lain dalam form. Pastikan:

- Field yang direferensi sudah ada di form
- Nama field di formula sesuai dengan `name` field
- Field numeric gunakan tipe `number`, `currency`, atau `gram`

### 4. Pengaturan Tampilan

**Decimal Places (Angka Desimal)**

- Tentukan presisi angka desimal
- Default: 2 digit
- Range: 0-10

**Prefix (Awalan)**

- Teks yang ditampilkan sebelum angka
- Contoh: "Rp", "$", "Total: "

**Suffix (Akhiran)**

- Teks yang ditampilkan setelah angka
- Contoh: "kg", "m²", "USD", "pcs"

### 5. Contoh Implementasi

#### Module: Sales Transaction

```json
{
  "fields": [
    {
      "name": "qty",
      "label": "Quantity",
      "type": "number"
    },
    {
      "name": "price",
      "label": "Unit Price",
      "type": "currency"
    },
    {
      "name": "discount",
      "label": "Discount (%)",
      "type": "number"
    },
    {
      "name": "subtotal",
      "label": "Subtotal",
      "type": "formula",
      "formula": "qty * price",
      "validation": {
        "decimals": 2,
        "prefix": "Rp"
      }
    },
    {
      "name": "total",
      "label": "Total After Discount",
      "type": "formula",
      "formula": "(qty * price) * (1 - discount / 100)",
      "validation": {
        "decimals": 2,
        "prefix": "Rp"
      }
    }
  ]
}
```

### 6. Batasan

- Field formula **read-only** (tidak bisa diedit manual)
- Formula harus valid secara matematika
- Field yang direferensi harus ada di form yang sama
- Nilai field yang belum diisi dianggap 0

### 7. Troubleshooting

**Error: "Invalid formula"**

- Periksa syntax formula
- Pastikan semua field yang direferensi ada
- Cek operator dan kurung berpasangan

**Hasil tidak sesuai**

- Periksa tipe data field yang direferensi
- Pastikan decimal places sesuai kebutuhan
- Cek urutan operasi matematika (gunakan kurung)

**Field tidak update**

- Pastikan field yang direferensi sudah terisi
- Refresh form jika diperlukan

## Referensi Math.js

Dokumentasi lengkap: https://mathjs.org/docs/expressions/syntax.html

### Fungsi Matematika Populer

| Fungsi     | Deskripsi         | Contoh           |
| ---------- | ----------------- | ---------------- |
| `abs(x)`   | Nilai absolut     | `abs(-5)` = 5    |
| `round(x)` | Pembulatan        | `round(3.7)` = 4 |
| `ceil(x)`  | Bulatkan ke atas  | `ceil(3.2)` = 4  |
| `floor(x)` | Bulatkan ke bawah | `floor(3.8)` = 3 |
| `sqrt(x)`  | Akar kuadrat      | `sqrt(16)` = 4   |
| `pow(x,y)` | Pangkat           | `pow(2,3)` = 8   |
| `max(...)` | Nilai maksimum    | `max(1,5,3)` = 5 |
| `min(...)` | Nilai minimum     | `min(1,5,3)` = 1 |
| `sum(...)` | Jumlah            | `sum(1,2,3)` = 6 |

### Konstanta

| Konstanta | Nilai      | Contoh     |
| --------- | ---------- | ---------- |
| `pi`      | 3.14159... | `pi * r^2` |
| `e`       | 2.71828... | `e^x`      |
