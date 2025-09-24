"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Calendar,
  Target,
  Lightbulb,
  Download,
  RefreshCw
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from "recharts";
import { useState } from "react";
import { useAdvancedAnalytics } from "@/hooks/use-advanced-analytics";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function AdvancedInsights() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter">("month");
  const { data: analytics, isLoading, refetch } = useAdvancedAnalytics(timeRange);

  if (isLoading) {
    return <div className="flex justify-center p-8">Carregando insights...</div>;
  }

  if (!analytics) {
    return <div className="text-center p-8">Erro ao carregar dados</div>;
  }

  const { productiveHours, categoryAnalysis, weeklyReports, monthlyTrends, insights } = analytics;

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "bg-red-50 text-red-700 border-red-200";
      case "medium": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default: return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "down": return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <BarChart3 className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bold text-2xl">Insights Avançados</h2>
          <p className="text-muted-foreground">
            Análise detalhada dos seus padrões de produtividade
          </p>
        </div>
        <div className="flex gap-2">
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
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((insight, index) => (
          <Card key={index} className={`border ${getImpactColor(insight.impact)}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 mt-1" />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{insight.title}</h4>
                  <p className="text-xs mt-1 opacity-80">{insight.description}</p>
                  <p className="text-xs mt-2 font-medium">{insight.recommendation}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productive Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Horários Mais Produtivos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productiveHours}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => {
                      const sanitizedValue = typeof value === 'number' ? value.toString() : String(value).replace(/[<>"'&]/g, '');
                      const label = name === "completedTasks" ? "Tarefas Concluídas" : "Eficiência";
                      const suffix = name === "completedTasks" ? " tarefas" : "%";
                      return [sanitizedValue + suffix, label];
                    }}
                  />
                  <Bar dataKey="completedTasks" fill="#3b82f6" name="completedTasks" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Análise por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryAnalysis.map((category, index) => (
                <div key={category.category} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div>
                      <p className="font-medium text-sm">{category.category}</p>
                      <p className="text-xs text-muted-foreground">
                        {category.completedTasks} tarefas • {category.totalTime}min
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {category.efficiency}%
                    </Badge>
                    {getTrendIcon(category.trend)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Relatórios Semanais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyReports}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="completedTasks" 
                    stroke="#10b981" 
                    name="Tarefas Concluídas"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="totalTasks" 
                    stroke="#3b82f6" 
                    name="Total de Tarefas"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Tendências Mensais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="productivity"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                    name="Produtividade"
                  />
                  <Area
                    type="monotone"
                    dataKey="consistency"
                    stackId="2"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                    name="Consistência"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Relatório Detalhado</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {weeklyReports.slice(0, 3).map((report, index) => (
              <div key={index} className="space-y-3">
                <h4 className="font-medium">{report.week}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Tarefas concluídas:</span>
                    <span className="font-medium">{report.completedTasks}/{report.totalTasks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tempo total:</span>
                    <span className="font-medium">{report.totalTime}min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Melhor dia:</span>
                    <span className="font-medium text-green-600">{report.bestDay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pior dia:</span>
                    <span className="font-medium text-red-600">{report.worstDay}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}