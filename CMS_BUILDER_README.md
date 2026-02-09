# CMS Builder - Application Development Platform

Sistem CMS yang powerful untuk membangun web application dengan visual form builder dan dynamic page rendering.

## 🎯 Fitur Utama

### 1. **Form Builder dengan Drag & Drop**

- Visual form designer dengan drag-and-drop interface
- 17+ field types (text, number, currency, date, select, async-select, dll)
- Field validation & dependencies
- Auto-code generation (e.g., `SLS-{YYYYMMDD}-{0001}`)
- Auto-fill dari relasi antar modul
- Preview real-time sebelum publish

### 2. **Dynamic Page Rendering**

- Generate halaman CRUD otomatis dari module definition
- Customizable table columns & form layouts
- Support untuk master data dan transaksi
- Dynamic API endpoints per module

### 3. **Relationship Management**

- One-to-one, one-to-many, many-to-many relationships
- Cascade delete options
- Auto-populate related data
- Visual relationship editor

### 4. **Release/Publish System**

- Draft & Published states
- Pre-publish validation checklist
- Export to FormJSON format
- One-click generate scaffold
- Version control ready

### 5. **Enhanced Module Generator**

- Auto-generate Prisma schema dari form definition
- Generate database migrations
- Create complete module structure (components, services, API)
- Bulk generation dari formJson directory

## 🚀 Quick Start

### 1. Setup Database

```bash
# Reset database (jika perlu)
npm run db:reset

# Atau migrate saja
npx prisma migrate dev
```

### 2. Sync Existing Modules ke Database

```bash
npm run cms:sync
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Akses CMS Builder

Buka browser dan akses:

- **Module Builder**: http://localhost:3000/admin/cms-builder
- **Page Builder**: http://localhost:3000/admin/page-builder

## 📖 Cara Penggunaan

### Membuat Module Baru (UI)

1. Buka **Module Builder** (`/admin/cms-builder`)
2. Klik **"New Module"**
3. Isi informasi basic:
   - Module Name: `Barang`
   - Resource Name: `barangs`
   - Table Name: `tm_barang`
   - Title: `Barang`
   - Module Type: `Master Data`

4. **Add Fields** dengan drag & drop:
   - Pilih field type (text, number, currency, dll)
   - Set properties (label, required, default value, dll)
   - Configure validation & dependencies

5. **Configure Relationships** (tab Relationships):
   - Pilih target module
   - Set relationship type (one-to-many, etc)
   - Configure cascade delete

6. **Publish** (tab Publish):
   - Review checklist
   - Klik "Publish Module"
   - Export to FormJSON (optional)
   - Generate Scaffold

### Membuat Module dari JSON

1. Buat file di `formJson/product.json`:

```json
{
  "moduleName": "Product",
  "resourceName": "products",
  "tableName": "tm_product",
  "title": "Product",
  "moduleType": "master",
  "route": "/admin/product",
  "classForm": "grid grid-cols-2 gap-4",
  "fields": [
    {
      "name": "kodeProduct",
      "label": "Product Code",
      "type": "text",
      "autoCode": "PRD-{00000}",
      "readOnly": true
    },
    {
      "name": "namaProduct",
      "label": "Product Name",
      "type": "text",
      "required": true
    },
    {
      "name": "kategoriId",
      "label": "Category",
      "type": "async-select",
      "endpoint": "/api/categories",
      "labelField": "name",
      "valueField": "id",
      "required": true
    },
    {
      "name": "harga",
      "label": "Price",
      "type": "rupiah",
      "required": true,
      "defaultValue": 0
    },
    {
      "name": "stock",
      "label": "Stock",
      "type": "number",
      "defaultValue": 0
    }
  ]
}
```

2. Generate module:

```bash
# Generate migration & scaffold
npm run generate:migration product
npx prisma migrate dev
npm run generate:module product

# Atau sekaligus
npm run generate:all:enhanced
```

3. Sync ke database:

```bash
npm run cms:sync
```

### Dynamic Page Access

Setelah module di-publish, halaman akan otomatis tersedia di:

- **List Page**: `/admin/dynamic/{resourceName}`
  - Example: `/admin/dynamic/products`
  - Auto-generated table dengan search & pagination
  - CRUD actions (Add, Edit, Delete)

- **Form Page**: `/admin/dynamic/{resourceName}/form`
  - Auto-rendered form dari field definitions
  - Validation otomatis
  - Relationship auto-populate

## 🎨 Field Types

| Type           | Description        | Use Case               |
| -------------- | ------------------ | ---------------------- |
| `text`         | Single line text   | Name, code, short text |
| `textarea`     | Multi-line text    | Description, notes     |
| `number`       | Integer input      | Quantity, age          |
| `currency`     | Currency input     | Price (any currency)   |
| `rupiah`       | Indonesian Rupiah  | Harga dalam Rupiah     |
| `gram`         | Weight in grams    | Berat emas, produk     |
| `date`         | Date picker        | Tanggal transaksi      |
| `datetime`     | Date & time picker | Timestamp lengkap      |
| `boolean`      | Checkbox           | Active/inactive flag   |
| `select`       | Dropdown (static)  | Status, kategori tetap |
| `async-select` | Dropdown from API  | Master data references |
| `email`        | Email input        | Email address          |
| `password`     | Password input     | Credentials            |
| `url`          | URL input          | Website, links         |
| `file`         | File upload        | Documents              |
| `image`        | Image upload       | Photos                 |
| `detail`       | Sub-form/cart      | Line items, details    |

## 🔗 Relationship Types

### One-to-Many

```json
{
  "name": "kategoriId",
  "type": "async-select",
  "endpoint": "/api/kategoris",
  "labelField": "name",
  "valueField": "id"
}
```

### Dependency (Cascading Select)

```json
{
  "name": "jenis",
  "type": "async-select",
  "endpoint": "/api/jenis",
  "labelField": "kodeJenis",
  "valueField": "id",
  "dependency": {
    "field": "kategori",
    "queryParam": "kodeGroup"
  }
}
```

### Auto-Fill from Relationship

```json
{
  "name": "barcode",
  "type": "text",
  "autoFill": {
    "namaBarang": "namaBarang",
    "berat": "berat",
    "harga": "hargaJual"
  },
  "endpoint": "/api/barangs",
  "searchField": "barcode"
}
```

## 📝 Advanced Features

### Auto Code Generation

```json
{
  "name": "transactionCode",
  "type": "text",
  "autoCode": "SLS-{YYYYMMDD}-{0001}",
  "readOnly": true
}
```

Patterns:

- `{YYYY}` - Year (4 digit)
- `{YY}` - Year (2 digit)
- `{MM}` - Month
- `{DD}` - Day
- `{0001}` - Sequential number

### Stock Management Logic

```json
{
  "stockLogic": {
    "type": "reduce",
    "targetTable": "tm_barang",
    "identifierField": "barangId",
    "stockField": "stock",
    "quantityField": "qty"
  }
}
```

### Detail/Cart Fields (Sub-forms)

```json
{
  "name": "items",
  "label": "Items",
  "type": "detail",
  "detailFields": [
    {
      "name": "barangId",
      "label": "Product",
      "type": "async-select",
      "endpoint": "/api/barangs"
    },
    {
      "name": "qty",
      "label": "Quantity",
      "type": "number"
    },
    {
      "name": "harga",
      "label": "Price",
      "type": "rupiah"
    }
  ]
}
```

## 🛠️ Available Scripts

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run start                  # Start production server

# Database
npm run db:reset              # Reset database
npx prisma migrate dev        # Run migrations
npm run prisma:studio         # Open Prisma Studio

# Module Generation
npm run generate:module bank        # Generate single module
npm run generate:migration bank     # Generate Prisma schema & migration
npm run generate:all:enhanced       # Generate all modules + migrations
npm run cms:sync                    # Sync formJson to database

# Module Management
npm run delete:module bank     # Delete single module
npm run delete:all            # Delete all modules
```

## 📂 Project Structure

```
src/
├── modules/
│   ├── cms-builder/              # CMS Builder module
│   │   ├── components/           # UI components
│   │   │   ├── form-builder.tsx         # Drag & drop form builder
│   │   │   ├── field-type-selector.tsx  # Field type picker
│   │   │   ├── relationship-manager.tsx # Relationship editor
│   │   │   ├── publish-manager.tsx      # Publish controls
│   │   │   └── dynamic-form-renderer.tsx # Runtime form renderer
│   │   ├── services/
│   │   │   └── module-service.ts # Module CRUD operations
│   │   └── types/
│   │       └── index.ts          # TypeScript types
│   │
│   ├── barangs/                  # Generated modules...
│   ├── kategoris/
│   └── ...
│
├── pages/
│   ├── admin/
│   │   ├── cms-builder/          # CMS Builder UI
│   │   ├── page-builder/         # Page Builder UI
│   │   └── dynamic/
│   │       └── [resourceName]/   # Dynamic CRUD pages
│   │
│   └── api/
│       ├── cms/                  # CMS management APIs
│       │   ├── modules/
│       │   ├── relationships/
│       │   └── scaffold.ts
│       └── dynamic/              # Dynamic module APIs
│           └── [resourceName]/
│
├── components/
│   ├── form/                     # Form components
│   └── ui/                       # UI components
│
└── config/
    └── menus.ts                  # Navigation menu

formJson/                         # Module definitions
├── barang.json
├── kategori.json
└── ...

scripts/
├── scaffold.ts                   # Module generator
├── generate-migration.ts         # Migration generator
├── generate-all-enhanced.ts      # Bulk generator
└── sync-cms-modules.ts          # Sync to database

prisma/
├── schema.prisma                 # Database schema
└── migrations/                   # Migration history
```

## 🎯 Use Cases

### 1. Point of Sale (Kasir)

**Master Data:**

- Kategori Barang
- Jenis Barang
- Barang (dengan stock management)

**Transaksi:**

- Penjualan (dengan detail items & stock reduction)
- Pembelian (dengan stock addition)

### 2. Online Store

**Master Data:**

- Categories
- Products
- Customers

**Transaksi:**

- Orders (dengan cart items)
- Payments
- Shipping

### 3. Inventory Management

**Master Data:**

- Warehouses
- Products
- Suppliers

**Transaksi:**

- Stock In
- Stock Out
- Stock Transfer

## 🔐 Security

- Protected routes dengan authentication
- Role-based access control (RBAC) ready
- SQL injection prevention dengan Prisma
- XSS protection
- CSRF token support

## 🚀 Deployment

### Production Build

```bash
npm run build
npm run start
```

### Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
JWT_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Hook Form](https://react-hook-form.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 💡 Tips & Tricks

### Best Practices

1. **Naming Conventions:**
   - Module Name: PascalCase (`Barang`, `SalesTransaction`)
   - Resource Name: kebab-case plural (`barangs`, `sales-transactions`)
   - Table Name: snake_case dengan prefix (`tm_barang`, `tr_sales`)

2. **Field Naming:**
   - Use camelCase (`kodeBarang`, `namaBarang`)
   - Be descriptive (`transactionDate` vs `date`)
   - Add `Id` suffix for foreign keys (`kategoriId`, `supplierId`)

3. **Module Organization:**
   - Pisahkan master data dan transaksi
   - Buat module yang reusable
   - Dokumentasikan relationships

4. **Performance:**
   - Index foreign key fields
   - Use pagination untuk large datasets
   - Optimize async-select queries

### Troubleshooting

**Problem: Module tidak muncul setelah generate**

```bash
# Solution: Sync to database
npm run cms:sync
```

**Problem: Migration error**

```bash
# Solution: Reset database
npm run db:reset
npm run generate:all:enhanced
```

**Problem: Field tidak muncul di form**

```bash
# Check field definition showInForm: true
# Re-sync module
npm run cms:sync
```

## 🎉 What's Next?

- [ ] Visual page layout editor
- [ ] Workflow automation
- [ ] Chart & dashboard builder
- [ ] API documentation generator
- [ ] Multi-language support
- [ ] Theme customization
- [ ] Mobile app generator

---

**Happy Building! 🚀**

Untuk pertanyaan atau bantuan, silakan buat issue di repository.
