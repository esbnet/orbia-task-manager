"use client";

import { useEffect, useState } from "react";

import { ClientProviders } from '../providers/client-providers';
import { ColumnFilter } from '../navigation/column-filter';
import { QuickMenu } from '../navigation/quick-menu';
import { TasksOverviewDialog } from './tasks-overview-dialog';
import { useSession } from "next-auth/react";
import { useTranslation } from "@/hooks/use-translation";
import { useUserConfig } from "@/hooks/use-user-config";

export default function HomePage() {
    const { data: session, status } = useSession();
    const { config } = useUserConfig();
    const { t } = useTranslation();
    const [showTasksDialog, setShowTasksDialog] = useState(false);
    const [columnFilter, setColumnFilter] = useState<"all" | "habits" | "dailies" | "todos" | "goals">("all");

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

    return (
        <main className="relative flex flex-col gap-4 mx-auto p-4 min-h-screen">
            <div className="flex shadow-sm p-4 border rounded-lg text-center animate-[fadeIn_1s_ease-in-out_forwards]">
                <div className="flex justify-between items-center w-full">
                    <div className="flex-1 font-bold text-4xl md:text-6xl text-center">
                        {t("home.title")}
                    </div>
                </div>
            </div>

            <div className="flex flex-col flex-1 gap-2 animate-[fadeIn_1s_ease-in-out_forwards]">
                <div className="flex flex-col">
                    <QuickMenu />
                    <ColumnFilter onFilterChange={setColumnFilter} />
                </div>
                <ClientProviders columnFilter={columnFilter} />
            </div>

            <TasksOverviewDialog
                open={showTasksDialog}
                onOpenChange={handleDialogClose}
            />
        </main>
    )
}
