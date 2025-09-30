"use client";

import { Eye, EyeOff, HeartPulse } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { ClientProviders } from '../providers/client-providers';
import { ColumnFilter } from '../navigation/column-filter';
import { QuickMenu } from '../navigation/quick-menu';
import { TasksOverviewDialog } from './tasks-overview-dialog';
import { WeeklyEvolutionChart } from '../dashboard/weekly-evolution-chart';
import { useSession } from "next-auth/react";
import { useTranslation } from "@/hooks/use-translation";
import { useUserConfig } from "@/hooks/use-user-config";

export default function HomePage() {
    const { data: session, status } = useSession();
    const { config } = useUserConfig();
    const { t } = useTranslation();
    const [showTasksDialog, setShowTasksDialog] = useState(false);
    const [columnFilter, setColumnFilter] = useState<"all" | "habits" | "dailies" | "todos" | "goals">("all");
    const [isChartVisible, setIsChartVisible] = useState(false);

    useEffect(() => {
        if (status === "authenticated" && session?.user && config.notifications) {
            // Check if dialog has been shown before
            const hasBeenShown = localStorage.getItem("tasksOverviewDialogShown");
            if (!hasBeenShown) {
                // Show dialog after a short delay to ensure the page has loaded
                const timer = setTimeout(() => {
                    setShowTasksDialog(true);
                }, 1000);

                return () => clearTimeout(timer);
            }
        }
    }, [status, session, config.notifications]);

    const handleDialogClose = (open: boolean) => {
        setShowTasksDialog(open);
        if (!open) {
            // Mark as shown when closed
            localStorage.setItem("tasksOverviewDialogShown", "true");
        }
    };

    return [
        <section className="relative flex flex-col mx-auto p-6 min-h-screen">
            {/* Header Section */}
            <div className="flex py-2 rounded-lg animate-[fadeIn_1s_ease-in-out_forwards]">
                <div className="flex flex-1 items-center gap-2 font-bold text-4xl md:text-6xl">
                    {t("home.title")}
                    <HeartPulse className="w-12 h-12 font-bold text-red-500 animate-caret-blink" />
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
                open={showTasksDialog}
                onOpenChange={handleDialogClose}
            />
        </section>
    ]
}
