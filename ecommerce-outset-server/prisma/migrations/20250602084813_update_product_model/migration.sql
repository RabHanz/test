/*
  Warnings:

  - You are about to drop the column `contentId` on the `PersonalizationRule` table. All the data in the column will be lost.
  - You are about to drop the column `contentKey` on the `PersonalizationRule` table. All the data in the column will be lost.
  - You are about to drop the column `engagementLevel` on the `PersonalizationRule` table. All the data in the column will be lost.
  - You are about to drop the column `personaId` on the `PersonalizationRule` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `PersonalizationContent` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[sku]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `action` to the `PersonalizationRule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `condition` to the `PersonalizationRule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `PersonalizationRule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sku` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PersonalizationRule" DROP CONSTRAINT "PersonalizationRule_contentId_fkey";

-- DropIndex
DROP INDEX "PersonalizationRule_personaId_engagementLevel_contentKey_key";

-- DropIndex
DROP INDEX "PersonalizationRule_personaId_engagementLevel_idx";

-- AlterTable
ALTER TABLE "PersonalizationRule" DROP COLUMN "contentId",
DROP COLUMN "contentKey",
DROP COLUMN "engagementLevel",
DROP COLUMN "personaId",
ADD COLUMN     "action" JSONB NOT NULL,
ADD COLUMN     "condition" JSONB NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "priority" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "image",
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "sku" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'draft';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "engagementLevel" TEXT NOT NULL DEFAULT 'low',
ADD COLUMN     "interactionCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastInteraction" TIMESTAMP(3);

-- DropTable
DROP TABLE "PersonalizationContent";

-- CreateTable
CREATE TABLE "Content" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],
    "engagementScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "targetPersonas" TEXT[],
    "conversionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalizationEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "interactionType" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wasCached" BOOLEAN NOT NULL DEFAULT false,
    "ruleMatched" BOOLEAN NOT NULL DEFAULT false,
    "actionTriggered" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PersonalizationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInteraction" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "contentId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceMetric" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerformanceMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentAnalytics" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "uniqueViews" INTEGER NOT NULL DEFAULT 0,
    "averageTimeOnPage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bounceRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "conversionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OptimizationRecommendation" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "effort" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OptimizationRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadCapture" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "calculatorType" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "personaType" TEXT,
    "leadScore" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadCapture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformData" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationProject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrationProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationVersion" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "changes" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "integrationId" TEXT NOT NULL,

    CONSTRAINT "IntegrationVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationDependency" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "integrationId" TEXT NOT NULL,

    CONSTRAINT "IntegrationDependency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationTest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "results" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "integrationId" TEXT NOT NULL,

    CONSTRAINT "IntegrationTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationDocumentation" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "integrationId" TEXT NOT NULL,

    CONSTRAINT "IntegrationDocumentation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationHealthCheck" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "responseTime" INTEGER NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "integrationId" TEXT NOT NULL,

    CONSTRAINT "IntegrationHealthCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationLog" (
    "id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "integrationId" TEXT NOT NULL,

    CONSTRAINT "IntegrationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationAlert" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "integrationId" TEXT NOT NULL,

    CONSTRAINT "IntegrationAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationMetric" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "integrationId" TEXT NOT NULL,

    CONSTRAINT "IntegrationMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Content_slug_key" ON "Content"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");

-- CreateIndex
CREATE INDEX "UserEvent_type_idx" ON "UserEvent"("type");

-- CreateIndex
CREATE INDEX "UserEvent_userId_idx" ON "UserEvent"("userId");

-- CreateIndex
CREATE INDEX "UserEvent_timestamp_idx" ON "UserEvent"("timestamp");

-- CreateIndex
CREATE INDEX "UserInteraction_type_idx" ON "UserInteraction"("type");

-- CreateIndex
CREATE INDEX "UserInteraction_userId_idx" ON "UserInteraction"("userId");

-- CreateIndex
CREATE INDEX "UserInteraction_contentId_idx" ON "UserInteraction"("contentId");

-- CreateIndex
CREATE INDEX "UserInteraction_timestamp_idx" ON "UserInteraction"("timestamp");

-- CreateIndex
CREATE INDEX "PerformanceMetric_type_idx" ON "PerformanceMetric"("type");

-- CreateIndex
CREATE INDEX "PerformanceMetric_timestamp_idx" ON "PerformanceMetric"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "ContentAnalytics_contentId_key" ON "ContentAnalytics"("contentId");

-- CreateIndex
CREATE INDEX "ContentAnalytics_contentId_idx" ON "ContentAnalytics"("contentId");

-- CreateIndex
CREATE INDEX "Alert_type_idx" ON "Alert"("type");

-- CreateIndex
CREATE INDEX "Alert_severity_idx" ON "Alert"("severity");

-- CreateIndex
CREATE INDEX "Alert_timestamp_idx" ON "Alert"("timestamp");

-- CreateIndex
CREATE INDEX "OptimizationRecommendation_type_idx" ON "OptimizationRecommendation"("type");

-- CreateIndex
CREATE INDEX "OptimizationRecommendation_impact_idx" ON "OptimizationRecommendation"("impact");

-- CreateIndex
CREATE INDEX "OptimizationRecommendation_effort_idx" ON "OptimizationRecommendation"("effort");

-- CreateIndex
CREATE INDEX "OptimizationRecommendation_priority_idx" ON "OptimizationRecommendation"("priority");

-- CreateIndex
CREATE INDEX "LeadCapture_email_idx" ON "LeadCapture"("email");

-- CreateIndex
CREATE INDEX "LeadCapture_calculatorType_idx" ON "LeadCapture"("calculatorType");

-- CreateIndex
CREATE INDEX "LeadCapture_personaType_idx" ON "LeadCapture"("personaType");

-- CreateIndex
CREATE INDEX "PlatformData_platform_idx" ON "PlatformData"("platform");

-- CreateIndex
CREATE INDEX "PlatformData_timestamp_idx" ON "PlatformData"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- AddForeignKey
ALTER TABLE "PersonalizationEvent" ADD CONSTRAINT "PersonalizationEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationVersion" ADD CONSTRAINT "IntegrationVersion_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "IntegrationProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationDependency" ADD CONSTRAINT "IntegrationDependency_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "IntegrationProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationTest" ADD CONSTRAINT "IntegrationTest_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "IntegrationProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationDocumentation" ADD CONSTRAINT "IntegrationDocumentation_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "IntegrationProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationHealthCheck" ADD CONSTRAINT "IntegrationHealthCheck_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "IntegrationProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationLog" ADD CONSTRAINT "IntegrationLog_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "IntegrationProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationAlert" ADD CONSTRAINT "IntegrationAlert_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "IntegrationProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationMetric" ADD CONSTRAINT "IntegrationMetric_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "IntegrationProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
