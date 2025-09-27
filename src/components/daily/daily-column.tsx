import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAvailableDailies, useCompleteDaily, useCreateDaily, useDeleteDaily, useUpdateDaily } from "@/hooks/use-dailies";
import type { Daily, DailyDifficulty } from "@/types/daily";
import { CalendarCheck, Info, Plus } from "lucide-react";
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

export const DailyColumn = () => {
	const createDailyMutation = useCreateDaily();
	const updateDailyMutation = useUpdateDaily();
	const deleteDailyMutation = useDeleteDaily();
	const { data: dailiesData, isLoading, } = useAvailableDailies();

	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingDaily, setEditingDaily] = useState<Daily | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [dailyToDelete, setDailyToDelete] = useState<Daily | null>(null);

	const { t } = useTranslation()

	// Usar dados do React Query
	const availableDailies = dailiesData?.availableDailies || [];
	const completedDailies = dailiesData?.completedToday || [];

	// Completar daily - usando React Query
	const { mutateAsync: completeDailyMutation } = useCompleteDaily();

	const handleCompleteDaily = useCallback(async (dailyId: string) => {
		try {
			await completeDailyMutation(dailyId);
		} catch (error) {
			toast.error(t("messages.errorCompletingTask"));
		}
	}, [completeDailyMutation]);

	// Funções de controle do formulário
	const openEditForm = async (daily: Daily) => {
		// Para dailies reais, usar os dados diretamente (já temos todos os dados necessários)
		setEditingDaily(daily);
		setIsFormOpen(true);
	};

	const closeForm = () => {
		setIsFormOpen(false);
		setEditingDaily(null);
	};

	// Criar nova daily
	const handleCreateDaily = async (dailyData: Omit<Daily, "id" | "createdAt">) => {
		try {
			await createDailyMutation.mutateAsync(dailyData);
			setIsFormOpen(false);
		} catch (error) {
			toast.error(t('messages.errorSaving'));
		}
	};

	// Editar daily existente
	const handleEditDaily = async (dailyData: Omit<Daily, "id" | "createdAt">) => {
		if (!editingDaily) {
			console.log('handleEditDaily: Nenhum daily sendo editado');
			return;
		}

		try {
			// Se for um daily mock, criar um novo daily real
			if (editingDaily.id.startsWith('mock-')) {
				const result = await createDailyMutation.mutateAsync(dailyData);
				toast.success(t('messages.taskCreated'));
			} else {
				// Para dailies reais, atualizar normalmente
				await updateDailyMutation.mutateAsync({
					id: editingDaily.id,
					data: {
						...editingDaily,
						...dailyData,
					}
				});
			}

			// console.log('handleEditDaily: Fechando formulário');
			setIsFormOpen(false);
			setEditingDaily(null);
		} catch (error) {
			toast.error(t('messages.errorSaving'));
		}
	};

	const confirmDeleteDaily = async () => {
		if (dailyToDelete) {
			try {
				// Chamar deleteDaily do React Query
				await deleteDailyMutation.mutateAsync(dailyToDelete.id);
				toast.success(`Daily "${dailyToDelete.title}" removida com sucesso!`);
				setIsDeleteDialogOpen(false);
				setDailyToDelete(null);
				// A lista será automaticamente atualizada pelo React Query
			} catch (error) {
				toast.error("Erro ao remover daily. Tente novamente.");
			}
		}
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
						<div className="flex items-center gap-2">
							<Button
								onClick={() => setIsFormOpen(true)}
								size="sm"
								className="bg-amber-600 hover:bg-amber-700 text-white"
							>
								<Plus className="mr-1 w-4 h-4" />
								{t('forms.newDaily')}
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent className="pt-0">
					<div className="flex justify-between items-center gap-4 text-amber-700 text-sm">
						<div className="flex items-center gap-1">
							<span>{availableDailies.length} {t('tasks.availableTasks')}</span>
						</div>
						{completedDailies.length > 0 && (
							<div className="flex items-center gap-1">
								<span>{completedDailies.length} {t('tasks.completedToday')}</span>
							</div>
						)}

						<Tooltip>
							<TooltipTrigger asChild className="self-end">
								<Info className="w-4 h-4 text-amber-500 hover:text-amber-700 transition-colors cursor-help" />
							</TooltipTrigger>
							<TooltipContent side="bottom" align="end" className="max-w-xs">
								<h1><CalendarCheck className="inline-block mr-1 w-3 h-3" />Foco: rotina</h1>
								<p>Tarefas que se repetem em intervalos regulares (diariamente, semanalmente, mensalmente). São compromissos recorrentes que precisam ser realizados periodicamente.</p>
							</TooltipContent>
						</Tooltip>
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
			{!isLoading && availableDailies.length > 0 && (
				<div className="space-y-4">
					{/* <h3 className="font-semibold text-amber-800">Disponíveis</h3> */}
					{availableDailies.map((daily: Daily) => (
						<DailyCard
							key={daily.id}
							daily={{
								id: daily.id,
								userId: daily.userId,
								title: daily.title,
								observations: daily.observations,
								difficulty: daily.difficulty as "Fácil",
								repeat: {
									type: (daily as any).repeatType as 'Diariamente',
									frequency: (daily as any).repeatFrequency
								},
								tags: daily.tags,
								startDate: new Date(),
								tasks: daily.tasks || [],
								createdAt: new Date(),
							}}
							onComplete={handleCompleteDaily}
							onEdit={openEditForm}
							isCompleted={false}
						/>
					))}
				</div>
			)}

			{/* Dailies Completadas Hoje */}
			{/* {!isLoading && completedDailies.length > 0 && (
				<div className="space-y-4">
					<h3 className="font-semibold text-green-800">Completadas Hoje</h3>
					{completedDailies.map((daily: Daily) => (
						<DailyCard
							key={daily.id}
							daily={{
								id: daily.id,
								userId: daily.userId,
								title: daily.title,
								observations: daily.observations,
								difficulty: daily.difficulty as "Fácil",
								repeat: {
									type: (daily as any).repeatType as 'Diariamente',
									frequency: (daily as any).repeatFrequency
								},
								tags: daily.tags,
								startDate: new Date(),
								tasks: daily.tasks || [],
								createdAt: new Date(),
							}}
							onComplete={handleCompleteDaily}
							isCompleted={true}
							nextAvailableAt={undefined}
						/>
					))}
				</div>
			)} */}

			{/* Estado vazio */}
			{!isLoading && availableDailies.length === 0 && completedDailies.length === 0 && (
				<Card className="bg-gray-50 border-gray-300 border-dashed">
					<CardContent className="py-8 text-center">
						<CalendarCheck className="mx-auto mb-3 w-12 h-12 text-gray-400" />
						<h3 className="mb-2 font-medium text-gray-600 text-lg">
							{t("noTasks.noTasksAvailable")}
						</h3>
						<p className="mb-4 text-gray-500">
							{t("noTasks.noTaskAvailableDescription")}
						</p>
						<Button
							onClick={() => setIsFormOpen(true)}
							className="bg-amber-600 hover:bg-amber-700"
						>
							<Plus className="mr-2 w-4 h-4" />
							{t("noTasks.createTask")}
						</Button>
					</CardContent>
				</Card>
			)}

			{/* Daily Form Modal */}
			<DailyForm
				daily={editingDaily || defaultDaily}
				onSubmit={editingDaily ? handleEditDaily : handleCreateDaily}
				onCancel={closeForm}
				open={isFormOpen}
			/>
		</div >
	);
};
