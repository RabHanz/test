-- Create ENUM types
CREATE TYPE "IntegrationStatus" AS ENUM (
  'ACTIVE',
  'INACTIVE',
  'PENDING',
  'FAILED',
  'MAINTENANCE',
  'DEPRECATED'
);

CREATE TYPE "IntegrationType" AS ENUM (
  'API',
  'WEBHOOK',
  'DATABASE',
  'FILE_TRANSFER',
  'MESSAGE_QUEUE',
  'CUSTOM'
);

CREATE TYPE "IntegrationProtocol" AS ENUM (
  'REST',
  'SOAP',
  'GRAPHQL',
  'FTP',
  'SFTP',
  'AMQP',
  'MQTT',
  'KAFKA',
  'CUSTOM'
);

CREATE TYPE "IntegrationSecurityType" AS ENUM (
  'API_KEY',
  'OAUTH2',
  'JWT',
  'BASIC_AUTH',
  'CERTIFICATE',
  'IP_WHITELIST',
  'CUSTOM'
);

-- Create tables
CREATE TABLE "integration_projects" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "type" "IntegrationType" NOT NULL,
  "protocol" "IntegrationProtocol" NOT NULL,
  "status" "IntegrationStatus" NOT NULL DEFAULT 'PENDING',
  "source_system" TEXT NOT NULL,
  "target_system" TEXT NOT NULL,
  "owner_id" TEXT NOT NULL,
  "team_id" TEXT NOT NULL,
  "endpoint_url" TEXT,
  "security_type" "IntegrationSecurityType",
  "credentials" JSONB,
  "config" JSONB,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "integration_logs" (
  "id" TEXT PRIMARY KEY,
  "integration_id" TEXT NOT NULL REFERENCES "integration_projects"("id") ON DELETE CASCADE,
  "level" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "metadata" JSONB,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "integration_metrics" (
  "id" TEXT PRIMARY KEY,
  "integration_id" TEXT NOT NULL REFERENCES "integration_projects"("id") ON DELETE CASCADE,
  "metric_type" TEXT NOT NULL,
  "value" DECIMAL(10,2) NOT NULL,
  "timestamp" TIMESTAMP NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "integration_alerts" (
  "id" TEXT PRIMARY KEY,
  "integration_id" TEXT NOT NULL REFERENCES "integration_projects"("id") ON DELETE CASCADE,
  "type" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "severity" TEXT NOT NULL,
  "is_resolved" BOOLEAN NOT NULL DEFAULT FALSE,
  "resolved_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "integration_versions" (
  "id" TEXT PRIMARY KEY,
  "integration_id" TEXT NOT NULL REFERENCES "integration_projects"("id") ON DELETE CASCADE,
  "version" TEXT NOT NULL,
  "changes" TEXT NOT NULL,
  "config" JSONB NOT NULL,
  "created_by" TEXT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "integration_dependencies" (
  "id" TEXT PRIMARY KEY,
  "integration_id" TEXT NOT NULL REFERENCES "integration_projects"("id") ON DELETE CASCADE,
  "dependent_integration_id" TEXT NOT NULL REFERENCES "integration_projects"("id") ON DELETE CASCADE,
  "dependency_type" TEXT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(integration_id, dependent_integration_id)
);

CREATE TABLE "integration_tests" (
  "id" TEXT PRIMARY KEY,
  "integration_id" TEXT NOT NULL REFERENCES "integration_projects"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "test_type" TEXT NOT NULL,
  "config" JSONB NOT NULL,
  "status" TEXT NOT NULL,
  "last_run" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "integration_documentation" (
  "id" TEXT PRIMARY KEY,
  "integration_id" TEXT NOT NULL REFERENCES "integration_projects"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "version" TEXT NOT NULL,
  "created_by" TEXT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX "integration_projects_status_idx" ON "integration_projects"("status");
CREATE INDEX "integration_projects_type_idx" ON "integration_projects"("type");
CREATE INDEX "integration_projects_owner_id_idx" ON "integration_projects"("owner_id");
CREATE INDEX "integration_projects_team_id_idx" ON "integration_projects"("team_id");
CREATE INDEX "integration_logs_integration_id_idx" ON "integration_logs"("integration_id");
CREATE INDEX "integration_metrics_integration_id_idx" ON "integration_metrics"("integration_id");
CREATE INDEX "integration_alerts_integration_id_idx" ON "integration_alerts"("integration_id");
CREATE INDEX "integration_versions_integration_id_idx" ON "integration_versions"("integration_id");
CREATE INDEX "integration_dependencies_integration_id_idx" ON "integration_dependencies"("integration_id");
CREATE INDEX "integration_tests_integration_id_idx" ON "integration_tests"("integration_id");
CREATE INDEX "integration_documentation_integration_id_idx" ON "integration_documentation"("integration_id");

-- Create triggers for updated_at
CREATE TRIGGER set_integration_projects_updated_at
  BEFORE UPDATE ON "integration_projects"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_integration_alerts_updated_at
  BEFORE UPDATE ON "integration_alerts"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_integration_tests_updated_at
  BEFORE UPDATE ON "integration_tests"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_integration_documentation_updated_at
  BEFORE UPDATE ON "integration_documentation"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 