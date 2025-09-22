"use client";

import {
  Activity,
  Award,
  BarChart3,
  Calendar,
  Clock,
  Target,
  TrendingDown,
  TrendingUp
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";
import { usePerformanceAnalytics } from "@/hooks/use-performance-analytics";
import { useState } from "react";
import { useTranslation } from "@/hooks/use-translation";

interface PerformanceData {
  productivity: number;
  consistency: number;
  efficiency: number;
  goalAchievement: number;
  weeklyTrend: number;
  monthlyTrend: number;
  averageTaskTime: number;
  completionRate: number;
  streakDays: number;
  bestDayOfWeek: string;
}

interface TimeSeriesData {
  date: string;
  completed: number;
  planned: number;
  efficiency: number;
  score: number;
}

export function PerformanceAnalytics() {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter">("month");
  const { data: analyticsData, isLoading } = usePerformanceAnalytics(timeRange);

  if (isLoading) {
    return <div className="flex justify-center p-8">Carregando analytics...</div>;
  }

  if (!analyticsData) {
    return <div className="p-8 text-center">Erro ao carregar dados</div>;
  }

  const { metrics, timeSeries, insights } = analyticsData;

  const radarData = [
    { metric: "Produtividade", value: metrics.productivity, fullMark: 100 },
    { metric: "Consistência", value: metrics.consistency, fullMark: 100 },
    { metric: "Eficiência", value: metrics.efficiency, fullMark: 100 },
    { metric: "Metas", value: metrics.goalAchievement, fullMark: 100 }
  ];



  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50";
    if (score >= 75) return "text-blue-600 bg-blue-50";
    if (score >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getTrendIcon = (trend: number) => {
    return trend > 0 ? (
      <TrendingUp className="w-4 h-4 text-green-500" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-500" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bold text-2xl">Análise de Desempenho</h2>
          <p className="text-muted-foreground">
            Insights detalhados sobre sua produtividade e progresso
          </p>
        </div>
        <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Semana</SelectItem>
            <SelectItem value="month">Mês</SelectItem>
            <SelectItem value="quarter">Trimestre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Score Cards */}
      <div className="gap-4 grid grid-cols-1 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-muted-foreground text-sm">Produtividade</p>
                <p className={`text-2xl font-bold ${getScoreColor(metrics.productivity)}`}>
                  {metrics.productivity}%
                </p>
              </div>
              <div className="bg-blue-50 p-2 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              {getTrendIcon(metrics.weeklyTrend)}
              <span className="ml-1">{Math.abs(metrics.weeklyTrend)}% esta semana</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-muted-foreground text-sm">Consistência</p>
                <p className={`text-2xl font-bold ${getScoreColor(metrics.consistency)}`}>
                  {metrics.consistency}%
                </p>
              </div>
              <div className="bg-green-50 p-2 rounded-lg">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="ml-1">Últimos 30 dias</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-muted-foreground text-sm">Eficiência</p>
                <p className={`text-2xl font-bold ${getScoreColor(metrics.efficiency)}`}>
                  {metrics.efficiency}%
                </p>
              </div>
              <div className="bg-orange-50 p-2 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <span className="text-muted-foreground">Tempo médio por tarefa</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-muted-foreground text-sm">Metas</p>
                <p className={`text-2xl font-bold ${getScoreColor(metrics.goalAchievement)}`}>
                  {metrics.goalAchievement}%
                </p>
              </div>
              <div className="bg-purple-50 p-2 rounded-lg">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <Award className="w-4 h-4 text-muted-foreground" />
              <span className="ml-1">Taxa de conclusão</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
        {/* Performance Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Tendência de Desempenho</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.1}
                    name="Score Geral"
                  />
                  <Line
                    type="monotone"
                    dataKey="efficiency"
                    stroke="#10b981"
                    name="Eficiência"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Perfil de Desempenho</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Desempenho"
                    dataKey="value"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insights e Recomendações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${insight.type === "positive"
                  ? "bg-green-50 border-green-200"
                  : "bg-yellow-50 border-yellow-200"
                  }`}
              >
                <h4 className="mb-2 font-medium">{insight.title}</h4>
                <p className="text-muted-foreground text-sm">{insight.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas Detalhadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <span className="font-medium">Taxa geral de conclusão</span>
              <Badge variant="secondary">{metrics.completionRate}%</Badge>
            </div>
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <span className="font-medium">Tempo médio por tarefa</span>
              <Badge variant="secondary">{metrics.averageTaskTime} min</Badge>
            </div>
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <span className="font-medium">Streak mais longo</span>
              <Badge variant="secondary">{metrics.streakDays} dias</Badge>
            </div>
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <span className="font-medium">Melhor dia da semana</span>
              <Badge variant="secondary">{metrics.bestDayOfWeek}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}