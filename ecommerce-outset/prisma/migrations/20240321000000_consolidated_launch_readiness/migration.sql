-- Create ENUM types
CREATE TYPE "LaunchStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED', 'DELAYED');
CREATE TYPE "LaunchPhase" AS ENUM ('PLANNING', 'PREPARATION', 'VALIDATION', 'EXECUTION', 'POST_LAUNCH');
CREATE TYPE "ValidationStatus" AS ENUM ('PENDING', 'PASSED', 'FAILED', 'SKIPPED');
CREATE TYPE "LaunchPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- Create tables
CREATE TABLE "launch_projects" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" "LaunchStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "phase" "LaunchPhase" NOT NULL DEFAULT 'PLANNING',
    "start_date" TIMESTAMP WITH TIME ZONE,
    "target_launch_date" TIMESTAMP WITH TIME ZONE,
    "actual_launch_date" TIMESTAMP WITH TIME ZONE,
    "owner_id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "launch_checklists" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL REFERENCES "launch_projects"("id") ON DELETE CASCADE,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "category" VARCHAR(100) NOT NULL,
    "priority" "LaunchPriority" NOT NULL DEFAULT 'MEDIUM',
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "status" "ValidationStatus" NOT NULL DEFAULT 'PENDING',
    "assigned_to" UUID,
    "due_date" TIMESTAMP WITH TIME ZONE,
    "completed_at" TIMESTAMP WITH TIME ZONE,
    "metadata" JSONB,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "launch_validations" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL REFERENCES "launch_projects"("id") ON DELETE CASCADE,
    "checklist_id" UUID REFERENCES "launch_checklists"("id") ON DELETE SET NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "validation_type" VARCHAR(100) NOT NULL,
    "status" "ValidationStatus" NOT NULL DEFAULT 'PENDING',
    "validation_result" JSONB,
    "validated_by" UUID,
    "validated_at" TIMESTAMP WITH TIME ZONE,
    "metadata" JSONB,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "launch_metrics" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL REFERENCES "launch_projects"("id") ON DELETE CASCADE,
    "metric_name" VARCHAR(255) NOT NULL,
    "metric_value" DECIMAL,
    "metric_unit" VARCHAR(50),
    "target_value" DECIMAL,
    "actual_value" DECIMAL,
    "status" "ValidationStatus" NOT NULL DEFAULT 'PENDING',
    "measured_at" TIMESTAMP WITH TIME ZONE,
    "metadata" JSONB,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "launch_timeline_events" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL REFERENCES "launch_projects"("id") ON DELETE CASCADE,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "event_type" VARCHAR(100) NOT NULL,
    "start_date" TIMESTAMP WITH TIME ZONE NOT NULL,
    "end_date" TIMESTAMP WITH TIME ZONE,
    "status" "LaunchStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "assigned_to" UUID,
    "dependencies" UUID[],
    "metadata" JSONB,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "launch_documents" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL REFERENCES "launch_projects"("id") ON DELETE CASCADE,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "document_type" VARCHAR(100) NOT NULL,
    "file_path" VARCHAR(255) NOT NULL,
    "file_size" INTEGER,
    "file_type" VARCHAR(50),
    "uploaded_by" UUID NOT NULL,
    "version" VARCHAR(50) NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "launch_team_members" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL REFERENCES "launch_projects"("id") ON DELETE CASCADE,
    "user_id" UUID NOT NULL,
    "role" VARCHAR(100) NOT NULL,
    "responsibilities" TEXT[],
    "is_lead" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("project_id", "user_id")
);

-- Create indexes
CREATE INDEX "idx_launch_projects_status" ON "launch_projects"("status");
CREATE INDEX "idx_launch_projects_phase" ON "launch_projects"("phase");
CREATE INDEX "idx_launch_projects_owner" ON "launch_projects"("owner_id");
CREATE INDEX "idx_launch_checklists_project" ON "launch_checklists"("project_id");
CREATE INDEX "idx_launch_checklists_status" ON "launch_checklists"("status");
CREATE INDEX "idx_launch_validations_project" ON "launch_validations"("project_id");
CREATE INDEX "idx_launch_validations_status" ON "launch_validations"("status");
CREATE INDEX "idx_launch_metrics_project" ON "launch_metrics"("project_id");
CREATE INDEX "idx_launch_timeline_events_project" ON "launch_timeline_events"("project_id");
CREATE INDEX "idx_launch_timeline_events_dates" ON "launch_timeline_events"("start_date", "end_date");
CREATE INDEX "idx_launch_documents_project" ON "launch_documents"("project_id");
CREATE INDEX "idx_launch_team_members_project" ON "launch_team_members"("project_id");

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_launch_projects_updated_at
    BEFORE UPDATE ON "launch_projects"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_launch_checklists_updated_at
    BEFORE UPDATE ON "launch_checklists"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_launch_validations_updated_at
    BEFORE UPDATE ON "launch_validations"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_launch_metrics_updated_at
    BEFORE UPDATE ON "launch_metrics"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_launch_timeline_events_updated_at
    BEFORE UPDATE ON "launch_timeline_events"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_launch_documents_updated_at
    BEFORE UPDATE ON "launch_documents"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_launch_team_members_updated_at
    BEFORE UPDATE ON "launch_team_members"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 