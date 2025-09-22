import { lazy } from "react";

// Lazy loading de componentes pesados
export const LazyAnalytics = lazy(() => import("../analytics/analytics-dashboard").then(module => ({ default: module.AnalyticsDashboard })));
export const LazySettings = lazy(() => import("../../app/(home)/settings/settings-page"));
export const LazyMetrics = lazy(() => import("../metrics/metrics-dashboard").then(module => ({ default: module.MetricsDashboard })));
export const LazyOrganization = lazy(() => import("../../app/(home)/organize/organize-page"));