"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AdvancedInsights } from "@/components/analytics/advanced-insights";
import { GoalProgressTracker } from "@/components/analytics/goal-progress-tracker";
import { PerformanceAnalytics } from "@/components/analytics/performance-analytics";
import { TimeTrackingDashboard } from "@/components/analytics/time-tracking-dashboard";
import { WeeklyReportGenerator } from "@/components/analytics/weekly-report-generator";
import { IndicatorsDashboard } from "@/components/dashboard/indicators-dashboard";
import type { Metadata } from "next";
import { useSearchParams } from "next/navigation";

export const metadata: Metadata = {
  title: "Analytics",
  description: "Análise detalhada do seu desempenho e progresso"
};

export default function AnalyticsPage() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "overview";

  return (
    <div className="space-y-6 mx-auto p-6">
      <div>
        <h1 className="font-bold text-3xl">Analytics & Insights</h1>
        <p className="text-muted-foreground">
          Análise detalhada do seu desempenho e progresso
        </p>
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList className="grid grid-cols-6 w-full">
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