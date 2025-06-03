import { useState, useEffect, useCallback } from 'react';
import { IntegrationService } from '../services/integration';
import { useUserStore } from '../store/userStore';
import { usePreferencesStore } from '../store/preferencesStore';
import type { IntegrationData, IntegrationConfig } from '../types/integration';

interface UseIntegrationDataOptions {
  autoLoad?: boolean;
  refreshInterval?: number;
  debug?: boolean;
}

interface IntegrationDataState {
  data: IntegrationData[];
  configs: IntegrationConfig[];
  isLoading: boolean;
  error: string | null;
}

export const useIntegrationData = (options: UseIntegrationDataOptions = {}) => {
  const {
    autoLoad = true,
    refreshInterval = 300000, // 5 minutes
    debug = false
  } = options;

  const [state, setState] = useState<IntegrationDataState>({
    data: [],
    configs: [],
    isLoading: false,
    error: null
  });

  const { user } = useUserStore();
  const { preferences } = usePreferencesStore();
  const integrationService = new IntegrationService();

  const loadIntegrationData = useCallback(async () => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const [data, configs] = await Promise.all([
        integrationService.getIntegrationData({
          userId: user.id,
          userPreferences: preferences
        }),
        integrationService.getIntegrationConfigs({
          userId: user.id,
          userPreferences: preferences
        })
      ]);
      setState({
        data,
        configs,
        isLoading: false,
        error: null
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to load integration data',
        isLoading: false
      }));
      if (debug) console.error('Integration data loading failed:', err);
    }
  }, [user, preferences, debug]);

  const updateIntegrationConfig = useCallback(async (configId: string, updates: Partial<IntegrationConfig>) => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const updatedConfig = await integrationService.updateIntegrationConfig({
        configId,
        updates,
        userId: user.id,
        userPreferences: preferences
      });
      setState(prev => ({
        ...prev,
        configs: prev.configs.map(config =>
          config.id === configId ? updatedConfig : config
        ),
        isLoading: false
      }));
      return updatedConfig;
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to update integration config',
        isLoading: false
      }));
      if (debug) console.error('Integration config update failed:', err);
      return null;
    }
  }, [user, preferences, debug]);

  const syncIntegrationData = useCallback(async (integrationId: string) => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const syncedData = await integrationService.syncIntegrationData({
        integrationId,
        userId: user.id,
        userPreferences: preferences
      });
      setState(prev => ({
        ...prev,
        data: prev.data.map(data =>
          data.integrationId === integrationId ? syncedData : data
        ),
        isLoading: false
      }));
      return syncedData;
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to sync integration data',
        isLoading: false
      }));
      if (debug) console.error('Integration data sync failed:', err);
      return null;
    }
  }, [user, preferences, debug]);

  useEffect(() => {
    if (!autoLoad) return;

    loadIntegrationData();

    const interval = setInterval(loadIntegrationData, refreshInterval);

    return () => clearInterval(interval);
  }, [autoLoad, refreshInterval, loadIntegrationData]);

  return {
    ...state,
    loadIntegrationData,
    updateIntegrationConfig,
    syncIntegrationData
  };
}; 