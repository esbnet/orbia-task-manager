import { NextRequest, NextResponse } from "next/server";

import { PrismaTagRepository } from "@/infra/database/prisma/prisma-tag-repository";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") || "month";

    // Buscar tags do usuário para análise de categorias
    const tagRepository = new PrismaTagRepository();
    const userTags = await tagRepository.list();

    const analyticsData = {
      productiveHours: generateProductiveHours(),
      categoryAnalysis: generateCategoryAnalysis(userTags),
      weeklyReports: generateWeeklyReports(timeRange, userTags),
      monthlyTrends: generateMonthlyTrends(),
      insights: generateInsights(userTags)
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error("Erro na API de analytics avançados:", error);
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

function generateCategoryAnalysis(userTags: any[]) {
  // Usar tags reais do usuário ou tags padrão se não houver
  const categories = userTags.length > 0
    ? userTags.map(tag => tag.name)
    : ["Trabalho", "Pessoal", "Saúde", "Estudos", "Casa"];

  return categories.map(category => ({
    category,
    totalTime: Math.floor(Math.random() * 120) + 30,
    completedTasks: Math.floor(Math.random() * 25) + 5,
    averageTime: Math.floor(Math.random() * 30) + 15,
    efficiency: Math.floor(Math.random() * 30) + 70,
    trend: ["up", "down", "stable"][Math.floor(Math.random() * 3)] as "up" | "down" | "stable"
  }));
}

function generateWeeklyReports(timeRange: string, userTags: any[]) {
  const weeks = timeRange === "quarter" ? 12 : timeRange === "month" ? 4 : 1;
  const reports = [];

  // Usar tags do usuário para topCategories
  const availableTags = userTags.length > 0
    ? userTags.map(tag => tag.name)
    : ["Trabalho", "Pessoal", "Saúde"];

  for (let i = 0; i < weeks; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (i * 7));

    // Selecionar top categories aleatoriamente das tags do usuário
    const topCategories = availableTags
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 3) + 1);

    reports.push({
      week: `Semana ${weeks - i}`,
      totalTasks: Math.floor(Math.random() * 50) + 30,
      completedTasks: Math.floor(Math.random() * 40) + 25,
      totalTime: Math.floor(Math.random() * 300) + 200,
      averageDaily: Math.floor(Math.random() * 8) + 5,
      bestDay: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"][Math.floor(Math.random() * 5)],
      worstDay: ["Sábado", "Domingo"][Math.floor(Math.random() * 2)],
      topCategories
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

function generateInsights(userTags: any[]) {
  const insights = [];

  // Insight personalizado baseado nas tags do usuário
  if (userTags.length > 0) {
    const randomTag = userTags[Math.floor(Math.random() * userTags.length)];
    insights.push({
      type: "category" as const,
      title: `Foco em ${randomTag.name}`,
      description: `Suas atividades em ${randomTag.name} mostram bom progresso`,
      recommendation: "Continue investindo tempo nesta categoria",
      impact: "medium" as const
    });
  }

  // Insights padrão
  insights.push(
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
      description: "Suas tarefas levam tempo adequado para conclusão",
      recommendation: "Mantenha o ritmo atual de trabalho",
      impact: "medium" as const
    }
  );

  return insights.slice(0, 4); // Máximo 4 insights
}