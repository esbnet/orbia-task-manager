"use client";

import { useEffect, useState } from "react";

import { useUserConfig } from "@/hooks/use-user-config";
import { useSession } from "next-auth/react";
import { ClientProviders } from '../providers/client-providers';
import { TasksOverviewDialog } from './tasks-overview-dialog';

export default function HomePage() {
    const { data: session, status } = useSession();
    const { config } = useUserConfig();
    const [showTasksDialog, setShowTasksDialog] = useState(false);

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
        <main className="relative flex flex-col gap-4 mx-auto p-4 lg:max-w-[80vw] min-h-screen">
            <div className="flex shadow-sm border rounded-lg text-center animate-[fadeIn_1s_ease-in-out_forwards]">
                <div className="flex justify-between items-center p-4 w-full">
                    <div className="flex-1 font-bold text-4xl md:text-6xl text-center">
                        Gerenciador de Tarefas
                    </div>
                </div>
            </div>

            <div className="flex flex-col flex-1 gap-4 shadow-md p-4 border rounded-lg animate-[fadeIn_1s_ease-in-out_forwards]">
                <ClientProviders />
            </div>

            <TasksOverviewDialog
                open={showTasksDialog}
                onOpenChange={handleDialogClose}
            />
        </main>
    )
}
