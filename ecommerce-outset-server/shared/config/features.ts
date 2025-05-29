export const FEATURES = {
  ENABLE_ADVANCED_ANALYTICS: process.env.ENABLE_ADVANCED_ANALYTICS === 'true',
  ENABLE_INTEGRATIONS: process.env.ENABLE_INTEGRATIONS === 'true',
  ENABLE_REAL_TIME_UPDATES: process.env.ENABLE_REAL_TIME_UPDATES === 'true',
  ENABLE_USER_FEEDBACK: process.env.ENABLE_USER_FEEDBACK === 'true',
  ENABLE_PERFORMANCE_MONITORING: process.env.ENABLE_PERFORMANCE_MONITORING === 'true'
};

export const isFeatureEnabled = (feature: keyof typeof FEATURES): boolean => {
  return FEATURES[feature] || false;
};

export const getEnabledFeatures = (): string[] => {
  return Object.entries(FEATURES)
    .filter(([_, enabled]) => enabled)
    .map(([feature]) => feature);
}; 