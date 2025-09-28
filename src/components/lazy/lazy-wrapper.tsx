import { Suspense, lazy } from "react";

import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Lazy components para code splitting
export const LazyAnalytics = lazy(() => import("../analytics/analytics-dashboard").then(module => ({ default: module.AnalyticsDashboard })));
export const LazySettings = lazy(() => import("../../app/(home)/settings/settings-page"));
export const LazyMetrics = lazy(() => import("../metrics/metrics-dashboard").then(module => ({ default: module.MetricsDashboard })));

interface LazyWrapperProps {
  children: React.ReactNode;
}

export function LazyWrapper({ children }: LazyWrapperProps) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {children}
    </Suspense>
  );
}