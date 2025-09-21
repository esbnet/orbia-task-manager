"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PerformanceAnalytics } from "@/components/analytics/performance-analytics";
import { GoalProgressTracker } from "@/components/analytics/goal-progress-tracker";
import { IndicatorsDashboard } from "@/components/dashboard/indicators-dashboard";
import { AdvancedInsights } from "@/components/analytics/advanced-insights";
import { WeeklyReportGenerator } from "@/components/analytics/weekly-report-generator";
import { TimeTrackingDashboard } from "@/components/analytics/time-tracking-dashboard";
import { useSearchParams } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Analytics - Orbia",
	description: "Análise detalhada do seu desempenho e progresso"
};

export default function AnalyticsPage() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "overview";

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics & Insights</h1>
        <p className="text-muted-foreground">
          Análise detalhada do seu desempenho e progresso
        </p>
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="performance">Desempenho</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="time">Tempo</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="goals">Metas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <IndicatorsDashboard />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <PerformanceAnalytics />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <AdvancedInsights />
        </TabsContent>

        <TabsContent value="time" className="space-y-6">
          <TimeTrackingDashboard />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <WeeklyReportGenerator />
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <GoalProgressTracker />
        </TabsContent>
      </Tabs>
    </div>
  );
}