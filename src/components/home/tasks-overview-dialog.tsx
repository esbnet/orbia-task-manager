"use client";

import { AlertTriangle, CalendarCheck, CheckCircle, Clock, Dumbbell, ListChecks, Target } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTodayTasks } from "@/hooks/use-today-tasks";
import { useTranslation } from "@/hooks/use-translation";

interface TasksOverviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TasksOverviewDialog({ open, onOpenChange }: TasksOverviewDialogProps) {
    const { t } = useTranslation();
    const { categorizedTasks, isLoading, overdueCount, pendingCount, totalCount } = useTodayTasks();

    const overdueTasks = categorizedTasks.overdue || [];
    const pendingTasks = categorizedTasks.pending || [];
    const allTasks = Object.values(categorizedTasks).flat();

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

                            {allTasks.length === 0 && (
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