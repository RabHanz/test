interface ErrorContext {
  ip?: string;
  endpoint?: string;
  method?: string;
  [key: string]: any;
}

class MonitoringService {
  trackError(error: Error, context: ErrorContext = {}) {
    // In a real implementation, this would send the error to a monitoring service
    console.error('Error tracked:', {
      message: error.message,
      stack: error.stack,
      context,
    });
  }
}

export const monitoringService = new MonitoringService(); 