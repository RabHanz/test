-- CreateTable
CREATE TABLE "PersonalizationRule" (
    "id" TEXT NOT NULL,
    "personaId" TEXT NOT NULL,
    "engagementLevel" TEXT NOT NULL,
    "contentKey" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "contentId" TEXT NOT NULL,

    CONSTRAINT "PersonalizationRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalizationContent" (
    "id" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonalizationContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PersonalizationRule_personaId_engagementLevel_idx" ON "PersonalizationRule"("personaId", "engagementLevel");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalizationRule_personaId_engagementLevel_contentKey_key" ON "PersonalizationRule"("personaId", "engagementLevel", "contentKey");

-- AddForeignKey
ALTER TABLE "PersonalizationRule" ADD CONSTRAINT "PersonalizationRule_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "PersonalizationContent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
