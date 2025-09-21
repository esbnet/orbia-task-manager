import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") || "month";

    const analyticsData = {
      productiveHours: generateProductiveHours(),
      categoryAnalysis: generateCategoryAnalysis(),
      weeklyReports: generateWeeklyReports(timeRange),
      monthlyTrends: generateMonthlyTrends(),
      insights: generateInsights()
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

function generateProductiveHours() {
  const hours = [];
  for (let i = 6; i <= 23; i++) {
    const completedTasks = Math.floor(Math.random() * 15) + 1;
    const efficiency = Math.floor(Math.random() * 40) + 60;
    
    hours.push({
      hour: i,
      completedTasks,
      efficiency,
      label: `${i}:00`
    });
  }
  
  // Simular picos de produtividade
  hours[3].completedTasks = 18; // 9h
  hours[3].efficiency = 95;
  hours[8].completedTasks = 16; // 14h
  hours[8].efficiency = 88;
  
  return hours;
}

function generateCategoryAnalysis() {
  const categories = ["Trabalho", "Pessoal", "Saúde", "Estudos", "Casa"];
  
  return categories.map(category => ({
    category,
    totalTime: Math.floor(Math.random() * 120) + 30,
    completedTasks: Math.floor(Math.random() * 25) + 5,
    averageTime: Math.floor(Math.random() * 30) + 15,
    efficiency: Math.floor(Math.random() * 30) + 70,
    trend: ["up", "down", "stable"][Math.floor(Math.random() * 3)] as "up" | "down" | "stable"
  }));
}

function generateWeeklyReports(timeRange: string) {
  const weeks = timeRange === "quarter" ? 12 : timeRange === "month" ? 4 : 1;
  const reports = [];
  
  for (let i = 0; i < weeks; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (i * 7));
    
    reports.push({
      week: `Semana ${weeks - i}`,
      totalTasks: Math.floor(Math.random() * 50) + 30,
      completedTasks: Math.floor(Math.random() * 40) + 25,
      totalTime: Math.floor(Math.random() * 300) + 200,
      averageDaily: Math.floor(Math.random() * 8) + 5,
      bestDay: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"][Math.floor(Math.random() * 5)],
      worstDay: ["Sábado", "Domingo"][Math.floor(Math.random() * 2)],
      topCategories: ["Trabalho", "Pessoal", "Saúde"].slice(0, Math.floor(Math.random() * 3) + 1)
    });
  }
  
  return reports;
}

function generateMonthlyTrends() {
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
  
  return months.map(month => ({
    month,
    productivity: Math.floor(Math.random() * 30) + 70,
    consistency: Math.floor(Math.random() * 25) + 75,
    totalHours: Math.floor(Math.random() * 50) + 100
  }));
}

function generateInsights() {
  return [
    {
      type: "productivity" as const,
      title: "Pico de Produtividade Matinal",
      description: "Você é 40% mais produtivo entre 9h-11h",
      recommendation: "Agende tarefas importantes neste horário",
      impact: "high" as const
    },
    {
      type: "time" as const,
      title: "Tempo Médio por Tarefa",
      description: "Suas tarefas de trabalho levam 25% mais tempo que o planejado",
      recommendation: "Considere quebrar tarefas grandes em menores",
      impact: "medium" as const
    },
    {
      type: "category" as const,
      title: "Categoria Mais Eficiente",
      description: "Tarefas de saúde têm 95% de taxa de conclusão",
      recommendation: "Aplique essa disciplina em outras áreas",
      impact: "medium" as const
    }
  ];
}