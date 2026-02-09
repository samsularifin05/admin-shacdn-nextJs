-- CreateTable
CREATE TABLE "cms_modules" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "resourceName" TEXT NOT NULL,
    "tableName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "moduleType" TEXT NOT NULL DEFAULT 'master',
    "route" TEXT,
    "classForm" TEXT,
    "printable" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_fields" (
    "id" SERIAL NOT NULL,
    "moduleId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "readOnly" BOOLEAN NOT NULL DEFAULT false,
    "readOnlyOnEdit" BOOLEAN NOT NULL DEFAULT false,
    "defaultValue" TEXT,
    "placeholder" TEXT,
    "helpText" TEXT,
    "validation" JSONB,
    "options" JSONB,
    "endpoint" TEXT,
    "labelField" TEXT,
    "valueField" TEXT,
    "relatedTable" TEXT,
    "relatedDisplayField" TEXT,
    "autoCode" TEXT,
    "autoFill" JSONB,
    "dependency" JSONB,
    "formula" TEXT,
    "uploadDir" TEXT,
    "detailFields" JSONB,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "showInList" BOOLEAN NOT NULL DEFAULT true,
    "showInForm" BOOLEAN NOT NULL DEFAULT true,
    "showInDetail" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_relationships" (
    "id" SERIAL NOT NULL,
    "sourceModuleId" INTEGER NOT NULL,
    "targetModuleId" INTEGER NOT NULL,
    "relationshipType" TEXT NOT NULL,
    "sourceField" TEXT NOT NULL,
    "targetField" TEXT NOT NULL DEFAULT 'id',
    "cascadeDelete" BOOLEAN NOT NULL DEFAULT false,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_relationships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_pages" (
    "id" SERIAL NOT NULL,
    "moduleId" INTEGER,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "layout" TEXT NOT NULL DEFAULT 'default',
    "content" JSONB,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_page_components" (
    "id" SERIAL NOT NULL,
    "pageId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "position" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_page_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_form_builders" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "schema" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_form_builders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cms_modules_name_key" ON "cms_modules"("name");

-- CreateIndex
CREATE UNIQUE INDEX "cms_modules_resourceName_key" ON "cms_modules"("resourceName");

-- CreateIndex
CREATE UNIQUE INDEX "cms_modules_tableName_key" ON "cms_modules"("tableName");

-- CreateIndex
CREATE UNIQUE INDEX "cms_relationships_sourceModuleId_sourceField_key" ON "cms_relationships"("sourceModuleId", "sourceField");

-- CreateIndex
CREATE UNIQUE INDEX "cms_pages_slug_key" ON "cms_pages"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "cms_form_builders_name_key" ON "cms_form_builders"("name");

-- AddForeignKey
ALTER TABLE "cms_fields" ADD CONSTRAINT "cms_fields_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "cms_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_relationships" ADD CONSTRAINT "cms_relationships_sourceModuleId_fkey" FOREIGN KEY ("sourceModuleId") REFERENCES "cms_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_relationships" ADD CONSTRAINT "cms_relationships_targetModuleId_fkey" FOREIGN KEY ("targetModuleId") REFERENCES "cms_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_pages" ADD CONSTRAINT "cms_pages_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "cms_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_page_components" ADD CONSTRAINT "cms_page_components_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "cms_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
