import { InputSanitizer } from '@/infra/validation/input-sanitizer';

// Monitor de performance para desenvolvimento
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(label: string): void {
    if (process.env.NODE_ENV === 'development') {
      this.metrics.set(label, performance.now());
    }
  }

  endTimer(label: string): number {
    if (process.env.NODE_ENV === 'development') {
      const start = this.metrics.get(label);
      if (start) {
        const duration = performance.now() - start;
        const safeLabel = InputSanitizer.sanitizeForLog(label);
        this.metrics.delete(label);
        return duration;
      }
    }
    return 0;
  }
}

export const perfMonitor = PerformanceMonitor.getInstance();