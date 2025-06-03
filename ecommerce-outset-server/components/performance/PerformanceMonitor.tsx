import React, { useEffect, useState } from 'react';
import { performanceService } from '../../src/services/performanceService';
import { isFeatureEnabled } from '../../shared/config/features';

interface PerformanceMonitorProps {
  refreshInterval?: number;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  refreshInterval = 5000
}) => {
  const [metrics, setMetrics] = useState<Record<string, { average: number; min: number; max: number }>>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isFeatureEnabled('ENABLE_PERFORMANCE_MONITORING')) {
      return;
    }

    const updateMetrics = () => {
      setMetrics(performanceService.getMetricsSummary());
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  if (!isFeatureEnabled('ENABLE_PERFORMANCE_MONITORING')) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 9999,
        cursor: 'pointer',
        maxWidth: '300px',
        maxHeight: '400px',
        overflow: 'auto'
      }}
      onClick={() => setIsVisible(!isVisible)}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
        Performance Monitor {isVisible ? '▼' : '▲'}
      </div>
      {isVisible && (
        <div>
          {Object.entries(metrics).map(([name, { average, min, max }]) => (
            <div key={name} style={{ marginBottom: '5px' }}>
              <div style={{ fontWeight: 'bold' }}>{name}</div>
              <div>Avg: {average.toFixed(2)}ms</div>
              <div>Min: {min.toFixed(2)}ms</div>
              <div>Max: {max.toFixed(2)}ms</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 