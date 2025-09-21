import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAvailableDailies, useCreateDaily, useDeleteDaily } from "@/hooks/use-dailies";
import { useDailyState } from "@/contexts/daily-state-context";
import type { Daily, DailyDifficulty } from "@/types/daily";
import { CalendarCheck, Plus } from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import { toast } from "sonner";
import { DailyCard } from "./daily-card";
import { DailyForm } from "./daily-form";

const defaultDaily: Daily = {
	id: "",
	userId: "",
	title: "",
	observations: "",
	tasks: [],
	difficulty: "Fácil" as DailyDifficulty,
	startDate: new Date(),
	repeat: { type: "Diariamente", frequency: 1 },
	tags: [],
	createdAt: new Date(),
};

export const DailyColumnRefactored = () => {
	// React Query hooks para dados
	const { data: dailiesData, isLoading } = useAvailableDailies();
	const createDailyMutation = useCreateDaily();
	const deleteDailyMutation = useDeleteDaily();

	// Context de estado puro
	const {
		isFormOpen,
		setIsFormOpen,
		editingDaily,
		setEditingDaily,
		filterDifficulty,
		filterRepeatType
	} = useDailyState();

	const { t } = useTranslation();

	// Dados filtrados
	const availableDailies = dailiesData?.availableDailies || [];
	const completedDailies = dailiesData?.completedToday || [];

	// Aplicar filtros do context
	const filteredAvailable = availableDailies.filter(daily => {
		if (filterDifficulty && daily.difficulty !== filterDifficulty) return false;
		if (filterRepeatType && daily.repeat.type !== filterRepeatType) return false;
		return true;
	});

	const handleCreateDaily = async (dailyData: Omit<Daily, "id" | "createdAt">) => {
		try {
			await createDailyMutation.mutateAsync(dailyData);
			setIsFormOpen(false);
		} catch (error) {
			toast.error(t('messages.errorSaving'));
		}
	};

	const closeForm = () => {
		setIsFormOpen(false);
		setEditingDaily(null);
	};

	return (
		<div className="flex flex-col gap-4 bg-gradient-to-br from-amber-50/30 dark:from-amber-950/20 to-orange-50/30 dark:to-orange-950/20 p-4 border border-amber-100/50 dark:border-amber-800/30 rounded-xl">
			<Card className="bg-gradient-to-r from-amber-50 dark:from-amber-900/50 to-blue-50 dark:to-blue-900/50 border-amber-200 dark:border-amber-700">
				<CardHeader className="pb-3">
					<div className="flex justify-between items-center">
						<div className="flex items-center gap-2">
							<CalendarCheck className="w-6 h-6 text-amber-600" />
							<CardTitle className="font-bold text-amber-900 text-xl">
								{t('taskTypes.daily')}
							</CardTitle>
						</div>
						<Button
							onClick={() => setIsFormOpen(true)}
							size="sm"
							className="bg-amber-600 hover:bg-amber-700 text-white"
						>
							<Plus className="mr-1 w-4 h-4" />
							{t('forms.newDaily')}
						</Button>
					</div>
				</CardHeader>
				<CardContent className="pt-0">
					<div className="flex items-center gap-4 text-amber-700 text-sm">
						<span>{filteredAvailable.length} {t('tasks.availableTasks')}</span>
						{completedDailies.length > 0 && (
							<span>{completedDailies.length} {t('tasks.completedToday')}</span>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Loading State */}
			{isLoading && (
				<Card className="bg-blue-50 border-blue-200">
					<CardContent className="py-8 text-center">
						<div className="mx-auto mb-3 border-4 border-t-transparent border-blue-600 rounded-full w-8 h-8 animate-spin"></div>
						<p className="text-blue-600">{t('tasks.loadingTasks')}</p>
					</CardContent>
				</Card>
			)}

			{/* Dailies Disponíveis */}
			{!isLoading && filteredAvailable.length > 0 && (
				<div className="space-y-4">
					<h3 className="font-semibold text-amber-800">Disponíveis</h3>
					{filteredAvailable.map((daily: Daily) => (
						<DailyCard
							key={daily.id}
							daily={daily}
							isCompleted={false}
						/>
					))}
				</div>
			)}

			{/* Daily Form Modal */}
			<DailyForm
				daily={editingDaily || defaultDaily}
				onSubmit={editingDaily ? undefined : handleCreateDaily}
				onCancel={closeForm}
				open={isFormOpen}
			/>
		</div>
	);
};