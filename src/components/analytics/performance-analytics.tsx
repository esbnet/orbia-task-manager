"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar, 
  Clock,
  Award,
  BarChart3,
  Activity
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { useState, useMemo } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { usePerformanceAnalytics } from "@/hooks/use-performance-analytics";

interface PerformanceData {
  productivity: number;
  consistency: number;
  efficiency: number;
  goalAchievement: number;
  weeklyTrend: number;
  monthlyTrend: number;
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
    return <div className="text-center p-8">Erro ao carregar dados</div>;
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Produtividade</p>
                <p className={`text-2xl font-bold ${getScoreColor(metrics.productivity)}`}>
                  {metrics.productivity}%
                </p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Consistência</p>
                <p className={`text-2xl font-bold ${getScoreColor(metrics.consistency)}`}>
                  {metrics.consistency}%
                </p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Eficiência</p>
                <p className={`text-2xl font-bold ${getScoreColor(metrics.efficiency)}`}>
                  {metrics.efficiency}%
                </p>
              </div>
              <div className="p-2 bg-orange-50 rounded-lg">
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Metas</p>
                <p className={`text-2xl font-bold ${getScoreColor(metrics.goalAchievement)}`}>
                  {metrics.goalAchievement}%
                </p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  insight.type === "positive" 
                    ? "bg-green-50 border-green-200" 
                    : "bg-yellow-50 border-yellow-200"
                }`}
              >
                <h4 className="font-medium mb-2">{insight.title}</h4>
                <p className="text-sm text-muted-foreground">{insight.description}</p>
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
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Tarefas completadas no prazo</span>
              <Badge variant="secondary">87%</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Tempo médio por tarefa</span>
              <Badge variant="secondary">25 min</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Streak mais longo</span>
              <Badge variant="secondary">12 dias</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Melhor dia da semana</span>
              <Badge variant="secondary">Terça-feira</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}