-- Migrate workflows
INSERT INTO "automation_workflows" (
    "id",
    "name",
    "platform",
    "type",
    "status",
    "trigger",
    "actions",
    "metadata",
    "created_at",
    "updated_at"
)
SELECT 
    id,
    name,
    platform::"AutomationPlatform",
    'WORKFLOW'::"AutomationType",
    status::"AutomationStatus",
    trigger,
    actions,
    jsonb_build_object(
        'description', description,
        'tags', tags,
        'personaType', persona_type
    ),
    created_at,
    updated_at
FROM "workflows";

-- Migrate rules
INSERT INTO "automation_rules" (
    "id",
    "name",
    "description",
    "conditions",
    "actions",
    "priority",
    "is_enabled",
    "created_at",
    "updated_at"
)
SELECT 
    id,
    name,
    description,
    conditions,
    actions,
    priority,
    is_enabled,
    created_at,
    updated_at
FROM "automation_rules_old";

-- Migrate metrics
INSERT INTO "automation_metrics" (
    "id",
    "workflow_id",
    "success_rate",
    "processing_time",
    "total_executions",
    "last_execution",
    "created_at",
    "updated_at"
)
SELECT 
    gen_random_uuid(),
    workflow_id,
    success_rate,
    average_processing_time,
    total_executions,
    last_execution,
    created_at,
    updated_at
FROM "workflow_metrics";

-- Migrate alerts
INSERT INTO "automation_alerts" (
    "id",
    "workflow_id",
    "rule_id",
    "type",
    "message",
    "severity",
    "status",
    "created_at",
    "updated_at"
)
SELECT 
    id,
    workflow_id,
    rule_id,
    type,
    message,
    severity,
    status::"AutomationStatus",
    created_at,
    updated_at
FROM "automation_alerts_old";

-- Verify data migration
DO $$
DECLARE
    workflow_count INTEGER;
    rule_count INTEGER;
    metric_count INTEGER;
    alert_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO workflow_count FROM "automation_workflows";
    SELECT COUNT(*) INTO rule_count FROM "automation_rules";
    SELECT COUNT(*) INTO metric_count FROM "automation_metrics";
    SELECT COUNT(*) INTO alert_count FROM "automation_alerts";

    RAISE NOTICE 'Migration completed: % workflows, % rules, % metrics, % alerts migrated',
        workflow_count, rule_count, metric_count, alert_count;
END $$; 