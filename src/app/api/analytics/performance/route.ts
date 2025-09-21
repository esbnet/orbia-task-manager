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

    const performanceData = {
      metrics: {
        productivity: Math.floor(Math.random() * 30) + 70,
        consistency: Math.floor(Math.random() * 25) + 75,
        efficiency: Math.floor(Math.random() * 40) + 60,
        goalAchievement: Math.floor(Math.random() * 20) + 80,
        weeklyTrend: Math.floor(Math.random() * 30) - 15,
        monthlyTrend: Math.floor(Math.random() * 20) - 10,
        averageTaskTime: Math.floor(Math.random() * 20) + 15,
        completionRate: Math.floor(Math.random() * 20) + 80,
        streakDays: Math.floor(Math.random() * 20) + 1,
        bestDayOfWeek: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"][Math.floor(Math.random() * 5)]
      },
      timeSeries: generateTimeSeries(timeRange),
      categoryPerformance: [
        { category: "Trabalho", completionRate: 85, averageTime: 30, totalTasks: 45 },
        { category: "Pessoal", completionRate: 78, averageTime: 20, totalTasks: 32 },
        { category: "Saúde", completionRate: 92, averageTime: 15, totalTasks: 28 }
      ],
      insights: [
        {
          type: "positive",
          title: "Excelente Consistência",
          description: "Você mantém uma rotina muito consistente"
        }
      ],
      predictions: {
        nextWeekScore: Math.floor(Math.random() * 20) + 80,
        recommendedGoals: ["Manter consistência", "Reduzir tempo por tarefa"],
        riskAreas: ["Tarefas acumulando"]
      }
    };

    return NextResponse.json(performanceData);
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

function generateTimeSeries(timeRange: string) {
  const days = timeRange === "week" ? 7 : 30;
  const data = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const planned = Math.floor(Math.random() * 5) + 8;
    const completed = Math.floor(Math.random() * planned) + Math.floor(planned * 0.6);
    
    data.push({
      date: date.toISOString().split('T')[0],
      completed,
      planned,
      efficiency: Math.floor((completed / planned) * 100),
      score: Math.floor(Math.random() * 30) + 70
    });
  }
  
  return data;
}