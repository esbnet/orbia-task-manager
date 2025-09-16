"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, CalendarCheck, CheckCircle, Clock, Dumbbell, ListChecks, Target } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";

interface TaskItem {
    id: string;
    title: string;
    type: "habit" | "daily" | "todo" | "goal";
    status: string;
    isOverdue: boolean;
    dueDate?: Date;
}

interface TasksOverviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TasksOverviewDialog({ open, onOpenChange }: TasksOverviewDialogProps) {
    const { t } = useTranslation();
    const [tasks, setTasks] = useState<TaskItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (open) {
            fetchAllTasks();
        }
    }, [open]);

    const fetchAllTasks = async () => {
        setIsLoading(true);
        try {
            const [habitsRes, dailiesRes, todosRes, goalsRes] = await Promise.all([
                fetch("/api/habits"),
                fetch("/api/daily"),
                fetch("/api/todos"),
                fetch("/api/goals"),
            ]);

            const [habitsData, dailiesData, todosData, goalsData] = await Promise.all([
                habitsRes.json(),
                dailiesRes.json(),
                todosRes.json(),
                goalsRes.json(),
            ]);

            const habits = habitsData.habits || [];
            const dailies = dailiesData.daily || [];
            const todos = todosData.todos || [];
            const goals = Array.isArray(goalsData) ? goalsData : [];

            const allTasks: TaskItem[] = [];

            // Process habits
            habits.forEach((habit: any) => {
                const isOverdue = habit.status === "Em Andamento" && habit.todayEntries === 0;
                allTasks.push({
                    id: habit.id,
                    title: habit.title,
                    type: "habit",
                    status: habit.status,
                    isOverdue,
                });
            });

            // Process dailies
            dailies.forEach((daily: any) => {
                const today = new Date().toDateString();
                const lastCompleted = daily.lastCompletedDate ? new Date(daily.lastCompletedDate).toDateString() : null;
                const isOverdue = !lastCompleted || lastCompleted !== today;
                allTasks.push({
                    id: daily.id,
                    title: daily.title,
                    type: "daily",
                    status: "Ativa", // Dailies don't have status, assume active
                    isOverdue,
                });
            });

            // Process todos
            todos.forEach((todo: any) => {
                const isOverdue = !todo.lastCompletedDate; // If not completed, consider overdue
                allTasks.push({
                    id: todo.id,
                    title: todo.title,
                    type: "todo",
                    status: todo.lastCompletedDate ? "Completa" : "Pendente",
                    isOverdue,
                });
            });

            // Process goals
            goals.forEach((goal: any) => {
                const isOverdue = goal.status === "IN_PROGRESS" &&
                    new Date(goal.targetDate) < new Date();
                allTasks.push({
                    id: goal.id,
                    title: goal.title,
                    type: "goal",
                    status: goal.status,
                    isOverdue,
                    dueDate: new Date(goal.targetDate),
                });
            });

            setTasks(allTasks);
        } catch (error) {
            console.error("Erro ao buscar tarefas:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const overdueTasks = tasks.filter(task => task.isOverdue);
    const pendingTasks = tasks.filter(task => !task.isOverdue && task.status === "IN_PROGRESS");

    const getTaskIcon = (type: string) => {
        switch (type) {
            case "habit": return <Dumbbell className="w-6 h-6 text-green-600" />;
            case "daily": return <CalendarCheck className="w-6 h-6 text-amber-600" />;
            case "todo": return <ListChecks className="w-6 h-6 text-blue-600" />;
            case "goal": return <Target className="w-6 h-6 text-purple-600" />;
            default: return <Target className="w-4 h-4" />;
        }
    };

    const getTaskTypeLabel = (type: string) => {
        switch (type) {
            case "habit": return t("taskTypes.habit");
            case "daily": return t("taskTypes.daily");
            case "todo": return t("taskTypes.todo");
            case "goal": return t("taskTypes.goal");
            default: return type;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {t("tasks.overview")}
                        {overdueTasks.length > 0 && (
                            <Badge variant="destructive" className="ml-2">
                                {overdueTasks.length} {t("tasks.overdue").toLowerCase()}
                            </Badge>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {t("tasks.overviewDescription")}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {isLoading ? (
                        <div className="py-8 text-center">
                            <div className="mx-auto mb-2 border-2 border-gray-300 border-t-blue-500 rounded-full w-8 h-8 animate-spin" />
                            <p>{t("tasks.loadingTasks")}</p>
                        </div>
                    ) : (
                        <>
                            {overdueTasks.length > 0 && (
                                <div>
                                    <h3 className="flex items-center gap-2 mb-3 font-semibold text-red-600">
                                        <AlertTriangle className="w-5 h-5" />
                                        {t("tasks.overdueTasks")} ({overdueTasks.length})
                                    </h3>
                                    <div className="space-y-2">
                                        {overdueTasks.map((task) => (
                                            <div key={task.id} className="flex items-center gap-3 bg-red-50 p-3 border border-red-200 rounded-lg">
                                                {getTaskIcon(task.type)}
                                                <div className="flex-1">
                                                    <p className="font-medium text-red-900">{task.title}</p>
                                                    <p className="text-red-700 text-sm">{getTaskTypeLabel(task.type)}</p>
                                                </div>
                                                <Badge variant="destructive">{t("tasks.overdue")}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {pendingTasks.length > 0 && (
                                <div>
                                    <h3 className="flex items-center gap-2 mb-3 font-semibold text-blue-600">
                                        <Clock className="w-5 h-5" />
                                        {t("tasks.pendingTasks")} ({pendingTasks.length})
                                    </h3>
                                    <div className="space-y-2">
                                        {pendingTasks.map((task) => (
                                            <div key={task.id} className="flex items-center gap-3 bg-blue-50 p-3 border border-blue-200 rounded-lg">
                                                {getTaskIcon(task.type)}
                                                <div className="flex-1">
                                                    <p className="font-medium text-blue-900">{task.title}</p>
                                                    <p className="text-blue-700 text-sm">{getTaskTypeLabel(task.type)}</p>
                                                </div>
                                                <Badge variant="secondary">{t("tasks.pending")}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {tasks.length === 0 && (
                                <div className="py-8 text-center">
                                    <CheckCircle className="mx-auto mb-4 w-12 h-12 text-green-500" />
                                    <p className="text-gray-600">{t("tasks.noActiveTasks")}</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="flex justify-end">
                    <Button onClick={() => onOpenChange(false)}>
                        {t("common.close")}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}