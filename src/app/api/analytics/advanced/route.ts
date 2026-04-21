import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/infra/database/prisma/prisma-client";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const timeRange = searchParams.get("timeRange") || "month";

        const analyticsData = await generateAnalyticsData(session.user.id, timeRange);
        return NextResponse.json(analyticsData);
    } catch {
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}

async function generateAnalyticsData(userId: string, timeRange: string) {
    const now = new Date();
    const startDate = new Date(now);
    if (timeRange === "week") startDate.setDate(now.getDate() - 7);
    else if (timeRange === "month") startDate.setDate(now.getDate() - 30);
    else if (timeRange === "quarter") startDate.setDate(now.getDate() - 90);

    const [habitLogs, todoLogs, goals] = await Promise.all([
        prisma.habitLog.findMany({
            where: { habit: { userId }, completedAt: { gte: startDate, lte: now } },
            include: { habit: true },
        }),
        prisma.todoLog.findMany({
            where: { todo: { userId }, completedAt: { gte: startDate, lte: now } },
            include: { todo: true },
        }),
        prisma.goal.findMany({ where: { userId } }),
    ]);

    return {
        productiveHours: generateProductiveHours(habitLogs, todoLogs),
        categoryAnalysis: generateCategoryAnalysis(habitLogs, todoLogs, goals),
        weeklyReports: generateWeeklyReports(timeRange),
        monthlyTrends: generateMonthlyTrends(habitLogs, todoLogs),
        insights: generateInsights(habitLogs, todoLogs, goals),
    };
}

function generateProductiveHours(habitLogs: any[], todoLogs: any[]) {
    const hourStats: Record<number, number> = {};
    for (let i = 6; i <= 23; i++) hourStats[i] = 0;

    [...habitLogs, ...todoLogs].forEach((log) => {
        const hour = log.completedAt.getHours();
        if (hour >= 6 && hour <= 23) hourStats[hour]++;
    });

    return Array.from({ length: 18 }, (_, idx) => {
        const hour = idx + 6;
        const completedTasks = hourStats[hour];
        return {
            hour,
            completedTasks,
            efficiency: completedTasks > 0 ? Math.min(100, 60 + completedTasks * 8) : 0,
            label: `${hour}:00`,
        };
    });
}

function generateCategoryAnalysis(habitLogs: any[], todoLogs: any[], goals: any[]) {
    const categories = [
        { category: "Hábitos", logs: habitLogs, averageTime: 15 },
        { category: "Tarefas", logs: todoLogs, averageTime: 30 },
        { category: "Metas", logs: goals, averageTime: 60 },
    ];

    return categories.map((cat) => {
        const completedTasks = cat.logs.length;
        return {
            category: cat.category,
            totalTime: completedTasks * cat.averageTime,
            completedTasks,
            averageTime: cat.averageTime,
            efficiency: completedTasks > 0 ? Math.min(100, 70 + Math.floor(completedTasks / 2)) : 0,
            trend: completedTasks > 5 ? "up" : completedTasks > 2 ? "stable" : "down",
        };
    });
}

function generateWeeklyReports(timeRange: string) {
    const weeks = timeRange === "quarter" ? 12 : timeRange === "month" ? 4 : 1;
    return Array.from({ length: weeks }, (_, i) => ({
        week: `Semana ${weeks - i}`,
        totalTasks: 30 + i * 2,
        completedTasks: 24 + i,
        totalTime: 200 + i * 10,
        averageDaily: 5 + Math.floor(i / 2),
        bestDay: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"][i % 5],
        worstDay: ["Sábado", "Domingo"][i % 2],
        topCategories: ["Hábitos", "Tarefas", "Metas"],
    }));
}

function generateMonthlyTrends(habitLogs: any[], todoLogs: any[]) {
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
    return months.map((month, index) => {
        const monthLogs = [...habitLogs, ...todoLogs].filter((log) => log.completedAt.getMonth() === index);
        const totalTasks = monthLogs.length;
        return {
            month,
            productivity: totalTasks > 0 ? Math.min(100, 70 + totalTasks * 2) : 0,
            consistency: totalTasks > 0 ? Math.min(100, 75 + Math.floor(totalTasks / 2)) : 0,
            totalHours: Math.floor(totalTasks * 0.5),
        };
    });
}

function generateInsights(habitLogs: any[], todoLogs: any[], goals: any[]) {
    const insights = [];
    const completedGoals = goals.filter((goal: any) => goal.status === "COMPLETED").length;

    if (habitLogs.length > todoLogs.length) {
        insights.push({
            type: "category",
            title: "Boa consistência em hábitos",
            description: `Você concluiu ${habitLogs.length} hábitos no período.`,
            recommendation: "Continue mantendo regularidade nos hábitos principais.",
            impact: "high",
        });
    }

    insights.push({
        type: "goals",
        title: "Andamento de metas",
        description: `${completedGoals} metas concluídas até agora.`,
        recommendation: "Quebre metas maiores em passos menores.",
        impact: "medium",
    });

    return insights;
}
