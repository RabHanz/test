import { useState, useEffect, useCallback } from 'react';
import * as integrationService from '../services/integrationService';
import {
  IntegrationProject,
  IntegrationLog,
  IntegrationMetric,
  IntegrationAlert,
  IntegrationVersion,
  IntegrationDependency,
  IntegrationTest,
  IntegrationDocumentation,
  IntegrationTimelineEvent,
  IntegrationHealthCheck,
  IntegrationFilter,
  IntegrationMetrics,
} from '../types/integration';

interface UseIntegrationDataReturn {
  integrations: IntegrationProject[];
  selectedIntegration: IntegrationProject | null;
  logs: IntegrationLog[];
  metrics: IntegrationMetric[];
  alerts: IntegrationAlert[];
  versions: IntegrationVersion[];
  dependencies: IntegrationDependency[];
  tests: IntegrationTest[];
  documentation: IntegrationDocumentation[];
  overallMetrics: IntegrationMetrics | null;
  timeline: IntegrationTimelineEvent[];
  healthChecks: IntegrationHealthCheck[];
  loading: boolean;
  error: string | null;
  loadData: (filter?: IntegrationFilter) => Promise<void>;
  selectIntegration: (integration: IntegrationProject) => Promise<void>;
  createIntegration: (integration: Partial<IntegrationProject>) => Promise<void>;
  updateIntegration: (id: string, integration: Partial<IntegrationProject>) => Promise<void>;
  deleteIntegration: (id: string) => Promise<void>;
}

export const useIntegrationData = (): UseIntegrationDataReturn => {
  const [integrations, setIntegrations] = useState<IntegrationProject[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationProject | null>(null);
  const [logs, setLogs] = useState<IntegrationLog[]>([]);
  const [metrics, setMetrics] = useState<IntegrationMetric[]>([]);
  const [alerts, setAlerts] = useState<IntegrationAlert[]>([]);
  const [versions, setVersions] = useState<IntegrationVersion[]>([]);
  const [dependencies, setDependencies] = useState<IntegrationDependency[]>([]);
  const [tests, setTests] = useState<IntegrationTest[]>([]);
  const [documentation, setDocumentation] = useState<IntegrationDocumentation[]>([]);
  const [overallMetrics, setOverallMetrics] = useState<IntegrationMetrics | null>(null);
  const [timeline, setTimeline] = useState<IntegrationTimelineEvent[]>([]);
  const [healthChecks, setHealthChecks] = useState<IntegrationHealthCheck[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    const unsubscribe = integrationService.subscribeToUpdates(handleRealTimeUpdate);
    return () => {
      integrationService.unsubscribeFromUpdates();
    };
  }, []);

  const handleRealTimeUpdate = useCallback((data: any) => {
    if (data.type === 'INTEGRATION') {
      setIntegrations(prevIntegrations =>
        prevIntegrations.map(integration =>
          integration.id === data.id ? { ...integration, ...data } : integration
        )
      );
    }
  }, []);

  const loadData = useCallback(async (filter?: IntegrationFilter) => {
    try {
      setLoading(true);
      const [integrationsData, metricsData] = await Promise.all([
        integrationService.getIntegrations(filter),
        integrationService.getIntegrationMetrics(),
      ]);
      setIntegrations(integrationsData);
      setOverallMetrics(metricsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const selectIntegration = useCallback(async (integration: IntegrationProject) => {
    setSelectedIntegration(integration);
    try {
      const [
        logsData,
        metricsData,
        alertsData,
        versionsData,
        dependenciesData,
        testsData,
        documentationData,
        timelineData,
        healthChecksData,
      ] = await Promise.all([
        integrationService.getLogs(integration.id),
        integrationService.getMetrics(integration.id),
        integrationService.getAlerts(integration.id),
        integrationService.getVersions(integration.id),
        integrationService.getDependencies(integration.id),
        integrationService.getTests(integration.id),
        integrationService.getDocumentation(integration.id),
        integrationService.getTimeline(integration.id),
        integrationService.getHealthChecks(integration.id),
      ]);
      setLogs(logsData);
      setMetrics(metricsData);
      setAlerts(alertsData);
      setVersions(versionsData);
      setDependencies(dependenciesData);
      setTests(testsData);
      setDocumentation(documentationData);
      setTimeline(timelineData);
      setHealthChecks(healthChecksData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }, []);

  const createIntegration = useCallback(async (integration: Partial<IntegrationProject>) => {
    try {
      const createdIntegration = await integrationService.createIntegration(integration);
      setIntegrations(prevIntegrations => [...prevIntegrations, createdIntegration]);
      return createdIntegration;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  }, []);

  const updateIntegration = useCallback(async (id: string, integration: Partial<IntegrationProject>) => {
    try {
      const updatedIntegration = await integrationService.updateIntegration(id, integration);
      setIntegrations(prevIntegrations =>
        prevIntegrations.map(integration =>
          integration.id === id ? { ...integration, ...updatedIntegration } : integration
        )
      );
      return updatedIntegration;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  }, []);

  const deleteIntegration = useCallback(async (id: string) => {
    try {
      await integrationService.deleteIntegration(id);
      setIntegrations(prevIntegrations =>
        prevIntegrations.filter(integration => integration.id !== id)
      );
      if (selectedIntegration?.id === id) {
        setSelectedIntegration(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  }, [selectedIntegration]);

  return {
    integrations,
    selectedIntegration,
    logs,
    metrics,
    alerts,
    versions,
    dependencies,
    tests,
    documentation,
    overallMetrics,
    timeline,
    healthChecks,
    loading,
    error,
    loadData,
    selectIntegration,
    createIntegration,
    updateIntegration,
    deleteIntegration,
  };
}; 