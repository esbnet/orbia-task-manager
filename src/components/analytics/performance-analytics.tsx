"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Activity,
  AlertTriangle,
  Award,
  BarChart3,
  Calendar,
  Clock,
  Tag,
  Target,
  TrendingDown,
  TrendingUp,
  Zap
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

import { Badge } from "@/components/ui/badge";
import { usePerformanceAnalytics } from "@/hooks/use-performance-analytics";
import { useTranslation } from "@/hooks/use-translation";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp } from "lucide-react";
import { format } from "date-fns";

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
  const [activeCategory, setActiveCategory] = useState<"habits" | "dailies" | "todos" | "goals">("habits");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"title" | "completedAt">("completedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const { data: analyticsData, isLoading } = usePerformanceAnalytics(timeRange);

  if (isLoading) {
    return <div className="flex justify-center p-8">Carregando analytics...</div>;
  }

  if (!analyticsData) {
    return <div className="p-8 text-center">Erro ao carregar dados</div>;
  }

  const { metrics, timeSeries, insights, tagAnalysis, priorityAnalysis, difficultyAnalysis, completionLogs } = analyticsData;

  const categoryMap = {
    habits: { label: "Hábitos", logs: completionLogs.habits },
    dailies: { label: "Diárias", logs: completionLogs.dailies },
    todos: { label: "Tarefas", logs: completionLogs.todos },
    goals: { label: "Metas", logs: completionLogs.goals },
  };

  const currentLogs = categoryMap[activeCategory].logs || [];
  const filteredLogs = currentLogs.filter((log) =>
    log.title.toLowerCase().includes(search.toLowerCase()),
  );
  const sortedLogs = [...filteredLogs].sort((a, b) => {
    if (sortBy === "title") {
      return sortDir === "asc"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    }
    const dateA = new Date(a.completedAt).getTime();
    const dateB = new Date(b.completedAt).getTime();
    return sortDir === "asc" ? dateA - dateB : dateB - dateA;
  });
  const totalPages = Math.max(1, Math.ceil(sortedLogs.length / pageSize));
  const paginatedLogs = sortedLogs.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (column: "title" | "completedAt") => {
    if (sortBy === column) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDir(column === "completedAt" ? "desc" : "asc");
    }
    setPage(1);
  };

  const radarData = [
    { metric: "Produtividade", value: metrics.productivity, fullMark: 100 },
    { metric: "Consistência", value: metrics.consistency, fullMark: 100 },
    { metric: "Eficiência", value: metrics.efficiency, fullMark: 100 },
    { metric: "Metas", value: metrics.goalAchievement, fullMark: 100 }
  ];



  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20";
    if (score >= 75) return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/20";
    return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20";
  };

  const getTrendIcon = (trend: number | string) => {
    if (typeof trend === "string") {
      return trend === "up" ? (
        <TrendingUp className="w-4 h-4 text-green-500 dark:text-green-400" />
      ) : trend === "down" ? (
        <TrendingDown className="w-4 h-4 text-red-500 dark:text-red-400" />
      ) : (
        <BarChart3 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      );
    }

    return trend > 0 ? (
      <TrendingUp className="w-4 h-4 text-green-500 dark:text-green-400" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-500 dark:text-red-400" />
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

      {/* Histórico de conclusões por categoria */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico por categoria</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(["habits", "dailies", "todos", "goals"] as const).map((key) => (
              <Button
                key={key}
                variant={activeCategory === key ? "default" : "outline"}
                onClick={() => {
                  setActiveCategory(key);
                  setPage(1);
                }}
              >
                {categoryMap[key].label}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Buscar descrição..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("title")}>
                    <div className="flex items-center gap-1">
                      Descrição {sortBy === "title" && (sortDir === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                    </div>
                  </TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("completedAt")}>
                    <div className="flex items-center gap-1">
                      Concluído em {sortBy === "completedAt" && (sortDir === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Nenhum registro encontrado.
                    </TableCell>
                  </TableRow>
                )}
                {paginatedLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.title}</TableCell>
                    <TableCell className="space-x-1">
                      {(log.tags || []).slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </TableCell>
                    <TableCell>{format(new Date(log.completedAt), "dd/MM/yyyy HH:mm")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Página {page} de {totalPages}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                Anterior
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                Próxima
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
              <div className="bg-blue-50 dark:bg-blue-950/20 p-2 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
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
              <div className="bg-green-50 dark:bg-green-950/20 p-2 rounded-lg">
                <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
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
              <div className="bg-orange-50 dark:bg-orange-950/20 p-2 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
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
              <div className="bg-purple-50 dark:bg-purple-950/20 p-2 rounded-lg">
                <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
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
                  ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                  : "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800"
                  }`}
              >
                <h4 className="mb-2 font-medium text-foreground">{insight.title}</h4>
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
            <div className="flex justify-between items-center bg-muted/50 p-3 rounded-lg">
              <span className="font-medium text-foreground">Taxa geral de conclusão</span>
              <Badge variant="secondary">{metrics.completionRate}%</Badge>
            </div>
            <div className="flex justify-between items-center bg-muted/50 p-3 rounded-lg">
              <span className="font-medium text-foreground">Tempo médio por tarefa</span>
              <Badge variant="secondary">{metrics.averageTaskTime} min</Badge>
            </div>
            <div className="flex justify-between items-center bg-muted/50 p-3 rounded-lg">
              <span className="font-medium text-foreground">Streak mais longo</span>
              <Badge variant="secondary">{metrics.streakDays} dias</Badge>
            </div>
            <div className="flex justify-between items-center bg-muted/50 p-3 rounded-lg">
              <span className="font-medium text-foreground">Melhor dia da semana</span>
              <Badge variant="secondary">{metrics.bestDayOfWeek}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Sections */}
      <div className="gap-6 grid grid-cols-1 lg:grid-cols-3">
        {/* Tag Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Eficiência por Etiquetas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tagAnalysis.slice(0, 5).map((tag, index) => (
                <div key={tag.tag} className="flex justify-between items-center bg-muted/50 p-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div
                      className="rounded-full w-3 h-3"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="font-medium text-sm">{tag.tag}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {tag.efficiency}%
                    </Badge>
                    {getTrendIcon(tag.trend)}
                  </div>
                </div>
              ))}
              {tagAnalysis.length === 0 && (
                <p className="py-4 text-muted-foreground text-sm text-center">
                  Nenhuma etiqueta encontrada
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Priority Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Análise por Prioridade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {priorityAnalysis.map((priority, index) => (
                <div key={priority.priority} className="flex justify-between items-center bg-muted/50 p-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${priority.priority === "Urgente" ? "bg-red-500" :
                      priority.priority === "Alta" ? "bg-orange-500" :
                        priority.priority === "Média" ? "bg-yellow-500" : "bg-green-500"
                      }`} />
                    <span className="font-medium text-sm">{priority.priority}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {priority.efficiency}%
                    </Badge>
                    {getTrendIcon(priority.trend)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Difficulty Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Análise por Dificuldade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {difficultyAnalysis.map((difficulty, index) => (
                <div key={difficulty.difficulty} className="flex justify-between items-center bg-muted/50 p-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${difficulty.difficulty === "Difícil" ? "bg-red-500" :
                      difficulty.difficulty === "Média" ? "bg-yellow-500" : "bg-green-500"
                      }`} />
                    <span className="font-medium text-sm">{difficulty.difficulty}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {difficulty.efficiency}%
                    </Badge>
                    {getTrendIcon(difficulty.trend)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
