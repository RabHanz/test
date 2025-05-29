-- CreateEnum
CREATE TYPE "AutomationPlatform" AS ENUM ('HUBSPOT', 'SALESFORCE', 'MARKETO', 'CUSTOM');

-- CreateEnum
CREATE TYPE "AutomationStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ERROR', 'DRAFT');

-- CreateEnum
CREATE TYPE "AutomationType" AS ENUM ('WORKFLOW', 'RULE', 'WEBHOOK');

-- CreateTable
CREATE TABLE "automation_workflows" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "platform" "AutomationPlatform" NOT NULL,
    "type" "AutomationType" NOT NULL,
    "status" "AutomationStatus" NOT NULL DEFAULT 'DRAFT',
    "trigger" JSONB NOT NULL,
    "actions" JSONB NOT NULL,
    "metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automation_workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_rules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "conditions" JSONB NOT NULL,
    "actions" JSONB NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_metrics" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workflow_id" UUID NOT NULL,
    "success_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "processing_time" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_executions" INTEGER NOT NULL DEFAULT 0,
    "last_execution" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automation_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_alerts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workflow_id" UUID,
    "rule_id" UUID,
    "type" VARCHAR(50) NOT NULL,
    "message" TEXT NOT NULL,
    "severity" VARCHAR(20) NOT NULL,
    "status" "AutomationStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automation_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "automation_workflows_platform_idx" ON "automation_workflows"("platform");

-- CreateIndex
CREATE INDEX "automation_workflows_status_idx" ON "automation_workflows"("status");

-- CreateIndex
CREATE INDEX "automation_rules_priority_idx" ON "automation_rules"("priority");

-- CreateIndex
CREATE INDEX "automation_metrics_workflow_id_idx" ON "automation_metrics"("workflow_id");

-- CreateIndex
CREATE INDEX "automation_alerts_workflow_id_idx" ON "automation_alerts"("workflow_id");

-- CreateIndex
CREATE INDEX "automation_alerts_rule_id_idx" ON "automation_alerts"("rule_id");

-- AddForeignKey
ALTER TABLE "automation_metrics" ADD CONSTRAINT "automation_metrics_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "automation_workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_alerts" ADD CONSTRAINT "automation_alerts_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "automation_workflows"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_alerts" ADD CONSTRAINT "automation_alerts_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "automation_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE; 