import { useEffect } from 'react';
import { trackPerformanceMetrics } from '../services/testingService';
import { PersonaType } from '../types/testing';

export const usePerformanceMonitoring = (personaType?: PersonaType) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reportWebVitals = async () => {
      // Track Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          trackPerformanceMetrics({
            lcp: lastEntry.startTime,
            pageLoadSpeed: performance.now(),
            fid: 0, // Will be updated by FID observer
            cls: 0, // Will be updated by CLS observer
            deviceType: window.innerWidth < 768 ? 'MOBILE' : 'DESKTOP',
            personaType
          });
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Track First Input Delay (FID)
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          trackPerformanceMetrics({
            lcp: 0, // Will be updated by LCP observer
            pageLoadSpeed: performance.now(),
            fid: entry.duration,
            cls: 0, // Will be updated by CLS observer
            deviceType: window.innerWidth < 768 ? 'MOBILE' : 'DESKTOP',
            personaType
          });
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Track Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            trackPerformanceMetrics({
              lcp: 0, // Will be updated by LCP observer
              pageLoadSpeed: performance.now(),
              fid: 0, // Will be updated by FID observer
              cls: clsValue,
              deviceType: window.innerWidth < 768 ? 'MOBILE' : 'DESKTOP',
              personaType
            });
          }
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // Track page load speed
      window.addEventListener('load', () => {
        const loadTime = performance.now();
        trackPerformanceMetrics({
          lcp: 0, // Will be updated by LCP observer
          pageLoadSpeed: loadTime,
          fid: 0, // Will be updated by FID observer
          cls: 0, // Will be updated by CLS observer
          deviceType: window.innerWidth < 768 ? 'MOBILE' : 'DESKTOP',
          personaType
        });
      });

      // Cleanup observers on unmount
      return () => {
        lcpObserver.disconnect();
        fidObserver.disconnect();
        clsObserver.disconnect();
      };
    };

    reportWebVitals();
  }, [personaType]);
}; 