-- Remote property evaluation: virtual tour URL on Property, photo metadata,
-- and a persisted remote condition checklist (8 stable item keys per property).

-- AlterTable
ALTER TABLE "Property" ADD COLUMN "virtualTourUrl" TEXT;

-- CreateTable
CREATE TABLE "PropertyPhoto" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConditionItem" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "itemKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unchecked',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConditionItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PropertyPhoto_propertyId_idx" ON "PropertyPhoto"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "ConditionItem_propertyId_itemKey_key" ON "ConditionItem"("propertyId", "itemKey");

-- CreateIndex
CREATE INDEX "ConditionItem_propertyId_idx" ON "ConditionItem"("propertyId");

-- AddForeignKey
ALTER TABLE "PropertyPhoto" ADD CONSTRAINT "PropertyPhoto_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConditionItem" ADD CONSTRAINT "ConditionItem_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
