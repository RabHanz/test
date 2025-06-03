import { useState, useEffect, useCallback } from 'react';
import { AnimationService } from '../services/animations';
import { useUserStore } from '../store/userStore';
import { usePreferencesStore } from '../store/preferencesStore';
import type { Animation, AnimationConfig } from '../types/animations';

interface UseAnimationsOptions {
  autoLoad?: boolean;
  refreshInterval?: number;
  debug?: boolean;
}

interface AnimationsState {
  animations: Animation[];
  configs: AnimationConfig[];
  isLoading: boolean;
  error: string | null;
}

export const useAnimations = (options: UseAnimationsOptions = {}) => {
  const {
    autoLoad = true,
    refreshInterval = 300000, // 5 minutes
    debug = false
  } = options;

  const [state, setState] = useState<AnimationsState>({
    animations: [],
    configs: [],
    isLoading: false,
    error: null
  });

  const { user } = useUserStore();
  const { preferences } = usePreferencesStore();
  const animationService = new AnimationService();

  const loadAnimations = useCallback(async () => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const [animations, configs] = await Promise.all([
        animationService.getAnimations({
          userId: user.id,
          userPreferences: preferences
        }),
        animationService.getConfigs({
          userId: user.id,
          userPreferences: preferences
        })
      ]);
      setState({
        animations,
        configs,
        isLoading: false,
        error: null
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to load animations',
        isLoading: false
      }));
      if (debug) console.error('Animations loading failed:', err);
    }
  }, [user, preferences, debug]);

  const updateConfig = useCallback(async (configId: string, updates: Partial<AnimationConfig>) => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const updatedConfig = await animationService.updateConfig({
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
        error: err instanceof Error ? err.message : 'Failed to update config',
        isLoading: false
      }));
      if (debug) console.error('Config update failed:', err);
      return null;
    }
  }, [user, preferences, debug]);

  const playAnimation = useCallback(async (animationId: string) => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const animation = await animationService.playAnimation({
        animationId,
        userId: user.id,
        userPreferences: preferences
      });
      setState(prev => ({
        ...prev,
        animations: prev.animations.map(anim =>
          anim.id === animationId ? animation : anim
        ),
        isLoading: false
      }));
      return animation;
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to play animation',
        isLoading: false
      }));
      if (debug) console.error('Animation playback failed:', err);
      return null;
    }
  }, [user, preferences, debug]);

  useEffect(() => {
    if (!autoLoad) return;

    loadAnimations();

    const interval = setInterval(loadAnimations, refreshInterval);

    return () => clearInterval(interval);
  }, [autoLoad, refreshInterval, loadAnimations]);

  return {
    ...state,
    loadAnimations,
    updateConfig,
    playAnimation
  };
}; 