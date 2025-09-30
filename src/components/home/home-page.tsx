"use client";

import { Eye, EyeOff, HeartCrackIcon, HeartPulse } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ClientProviders } from '../providers/client-providers';
import { ColumnFilter } from '../navigation/column-filter';
import { QuickMenu } from '../navigation/quick-menu';
import { TasksOverviewDialog } from './tasks-overview-dialog';
import { WeeklyEvolutionChart } from '../dashboard/weekly-evolution-chart';
import { useInitialDialog } from "@/hooks/use-initial-dialog";
import { useState } from "react";
import { useTodayTasks } from "@/hooks/use-today-tasks";
import { useTranslation } from "@/hooks/use-translation";

export default function HomePage() {
    const { t } = useTranslation();
    const { shouldShowDialog, markDialogAsShown } = useInitialDialog();
    const { totalCount, isLoading: tasksLoading } = useTodayTasks();
    const [columnFilter, setColumnFilter] = useState<"all" | "habits" | "dailies" | "todos" | "goals">("all");
    const [isChartVisible, setIsChartVisible] = useState(false);

    // Determinar qual ícone mostrar baseado na presença de atividades
    const hasActivitiesToday = totalCount > 0;

    const handleDialogClose = (open: boolean) => {
        if (!open) {
            markDialogAsShown();
        }
    };

    return (
        <section className="relative flex flex-col mx-auto p-6 min-h-screen">
            {/* Header Section */}
            <div className="flex py-2 rounded-lg animate-[fadeIn_1s_ease-in-out_forwards]">
                <div className="flex flex-1 justify-between items-center gap-4 font-bold text-4xl md:text-6xl">
                    {t("home.title")}
                    <div className="flex flex-col items-center gap-1">

                        {!tasksLoading && (<>
                            {hasActivitiesToday ? (
                                <HeartPulse className={`w-12 h-12 font-bold transition-all duration-300 ${hasActivitiesToday
                                    ? "text-red-500 drop-shadow-lg scale-110 animate-caret-blink"
                                    : "text-gray-400 opacity-50 grayscale scale-90"
                                    }`} />
                            ) : (<HeartCrackIcon className={`w-12 h-12 font-bold transition-all duration-300 ${hasActivitiesToday
                                ? "text-red-500 drop-shadow-lg scale-110 animate-caret-blink"
                                : "text-green-400 opacity-50  scale-90"
                                }`} />)}


                            <span className={`text-xs font-medium px-2 py-1 rounded-full transition-colors ${hasActivitiesToday
                                ? "text-red-700 bg-red-100"
                                : "text-green-600 bg-green-100"
                                }`}>
                                {totalCount > 0 ? `${totalCount} hoje` : "Dia livre"}
                            </span>
                        </>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Section */}
            <div className="flex flex-col flex-1 gap-6 animate-[fadeIn_1s_ease-in-out_forwards]">
                {/* Navigation and Controls */}
                <div className="flex flex-col">
                    <QuickMenu />
                    <div className="flex justify-between items-center">
                        <div className="flex justify-end-safe items-center gap-4 w-full">
                            <ColumnFilter onFilterChange={setColumnFilter} />
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setIsChartVisible(!isChartVisible)}
                                title={isChartVisible ? "Ocultar gráfico de evolução semanal" : "Mostrar gráfico de evolução semanal"}
                                className="flex-shrink-0 rounded-full"
                            >
                                {isChartVisible ? (
                                    <EyeOff className="w-4 h-4" />
                                ) : (
                                    <Eye className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Chart Section */}
                {isChartVisible && (
                    <div className="w-full">
                        <WeeklyEvolutionChart />
                    </div>
                )}

                {/* Content Providers - Takes remaining space */}
                <div className="flex-1 min-h-0">
                    <ClientProviders columnFilter={columnFilter} />
                </div>
            </div>

            {/* Dialog */}
            <TasksOverviewDialog
                open={shouldShowDialog}
                onOpenChange={handleDialogClose}
            />
        </section>
    )
}
