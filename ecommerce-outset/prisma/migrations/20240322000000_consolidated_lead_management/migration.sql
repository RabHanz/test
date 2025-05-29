-- Create ENUM types
CREATE TYPE "LeadStatus" AS ENUM (
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'PROPOSAL',
  'NEGOTIATION',
  'CLOSED_WON',
  'CLOSED_LOST',
  'ON_HOLD'
);

CREATE TYPE "LeadSource" AS ENUM (
  'WEBSITE',
  'REFERRAL',
  'SOCIAL_MEDIA',
  'EMAIL_CAMPAIGN',
  'EVENT',
  'DIRECT_CALL',
  'OTHER'
);

CREATE TYPE "LeadPriority" AS ENUM (
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT'
);

CREATE TYPE "CommunicationType" AS ENUM (
  'EMAIL',
  'CALL',
  'MEETING',
  'MESSAGE',
  'OTHER'
);

-- Create tables
CREATE TABLE "lead_projects" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
  "source" "LeadSource" NOT NULL,
  "priority" "LeadPriority" NOT NULL DEFAULT 'MEDIUM',
  "owner_id" TEXT NOT NULL,
  "team_id" TEXT NOT NULL,
  "company_name" TEXT,
  "contact_name" TEXT NOT NULL,
  "contact_email" TEXT,
  "contact_phone" TEXT,
  "expected_value" DECIMAL(10,2),
  "expected_close_date" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "lead_communications" (
  "id" TEXT PRIMARY KEY,
  "lead_id" TEXT NOT NULL REFERENCES "lead_projects"("id") ON DELETE CASCADE,
  "type" "CommunicationType" NOT NULL,
  "content" TEXT NOT NULL,
  "direction" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "lead_notes" (
  "id" TEXT PRIMARY KEY,
  "lead_id" TEXT NOT NULL REFERENCES "lead_projects"("id") ON DELETE CASCADE,
  "content" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "lead_tasks" (
  "id" TEXT PRIMARY KEY,
  "lead_id" TEXT NOT NULL REFERENCES "lead_projects"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "due_date" TIMESTAMP,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "assigned_to" TEXT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "lead_documents" (
  "id" TEXT PRIMARY KEY,
  "lead_id" TEXT NOT NULL REFERENCES "lead_projects"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "lead_metrics" (
  "id" TEXT PRIMARY KEY,
  "lead_id" TEXT NOT NULL REFERENCES "lead_projects"("id") ON DELETE CASCADE,
  "metric_type" TEXT NOT NULL,
  "value" DECIMAL(10,2) NOT NULL,
  "date" TIMESTAMP NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "lead_tags" (
  "id" TEXT PRIMARY KEY,
  "lead_id" TEXT NOT NULL REFERENCES "lead_projects"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX "lead_projects_status_idx" ON "lead_projects"("status");
CREATE INDEX "lead_projects_owner_id_idx" ON "lead_projects"("owner_id");
CREATE INDEX "lead_projects_team_id_idx" ON "lead_projects"("team_id");
CREATE INDEX "lead_communications_lead_id_idx" ON "lead_communications"("lead_id");
CREATE INDEX "lead_notes_lead_id_idx" ON "lead_notes"("lead_id");
CREATE INDEX "lead_tasks_lead_id_idx" ON "lead_tasks"("lead_id");
CREATE INDEX "lead_documents_lead_id_idx" ON "lead_documents"("lead_id");
CREATE INDEX "lead_metrics_lead_id_idx" ON "lead_metrics"("lead_id");
CREATE INDEX "lead_tags_lead_id_idx" ON "lead_tags"("lead_id");

-- Create triggers for updated_at
CREATE TRIGGER set_lead_projects_updated_at
  BEFORE UPDATE ON "lead_projects"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_lead_communications_updated_at
  BEFORE UPDATE ON "lead_communications"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_lead_notes_updated_at
  BEFORE UPDATE ON "lead_notes"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_lead_tasks_updated_at
  BEFORE UPDATE ON "lead_tasks"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_lead_documents_updated_at
  BEFORE UPDATE ON "lead_documents"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_lead_metrics_updated_at
  BEFORE UPDATE ON "lead_metrics"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_lead_tags_updated_at
  BEFORE UPDATE ON "lead_tags"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 