"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAvailableHabits, useCreateHabit, useDeleteHabit, useRegisterHabit, useUpdateHabit } from "@/hooks/use-habits";
import { Dumbbell, Info, Plus, RefreshCcw, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import type { Habit } from "@/domain/entities/habit";
import { useMultipleHabitStats } from "@/hooks/use-habit-stats";
import { useState } from "react";
import { toast } from "sonner";
import { HabitCard } from "./habit-card";
import { HabitForm } from "./habit-form";

export function HabitColumn() {
	const { data: habitsData, isLoading } = useAvailableHabits();
	const createHabitMutation = useCreateHabit();
	const updateHabitMutation = useUpdateHabit();
	const deleteHabitMutation = useDeleteHabit();
	const registerHabitMutation = useRegisterHabit();

	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
	// Usar dados do React Query
	const availableHabits = habitsData?.availableHabits || [];
	const completedInCurrentPeriod = habitsData?.completedInCurrentPeriod || [];
	const totalHabits = habitsData?.totalHabits || 0;

	// Carregar estatísticas para todos os hábitos disponíveis
	const habitIds = availableHabits.map(habit => habit.id);
	const { data: habitStats = {} } = useMultipleHabitStats(habitIds);

	const handleCreateHabit = async (habitData: any) => {
		try {
			// Adicionar userId se não estiver presente
			const dataWithUserId = {
				...habitData,
				userId: habitData.userId, // TODO: Get from auth context
			};
			await createHabitMutation.mutateAsync(dataWithUserId);
			toast.success(`Hábito "${habitData.title}" criado com sucesso!`);
			setIsFormOpen(false);
		} catch (error) {
			toast.error("Erro ao criar hábito. Tente novamente.");
		}
	};

	const handleEditHabit = async (habitData: any) => {
		if (editingHabit) {
			try {
				await updateHabitMutation.mutateAsync({
					id: editingHabit.id,
					data: habitData
				});
				toast.success(`Hábito "${habitData.title}" atualizado com sucesso!`);
				setEditingHabit(null);
				setIsFormOpen(false);
			} catch (error) {
				toast.error("Erro ao atualizar hábito. Tente novamente.");
			}
		}
	};

	const confirmDeleteHabit = async () => {
		if (habitToDelete) {
			try {
				await deleteHabitMutation.mutateAsync(habitToDelete.id);
				toast.success(`Hábito "${habitToDelete.title}" excluído com sucesso!`);
				setHabitToDelete(null);
				setIsDeleteDialogOpen(false);
			} catch (error) {
				toast.error("Erro ao excluir hábito. Tente novamente.");
				setIsDeleteDialogOpen(false);
			}
		}
	};

	const handleStatusChange = async (
		habitId: string,
		status: Habit["status"],
	) => {
		const habit = availableHabits.find((h) => h.id === habitId) ||
			completedInCurrentPeriod.find((h) => h.id === habitId);
		if (habit) {
			try {
				await updateHabitMutation.mutateAsync({
					id: habitId,
					data: { status }
				});
				const statusText = status === "Completo" ? "concluído" :
					status === "Cancelado" ? "cancelado" : "atualizado";
				toast.success(`Hábito "${habit.title}" ${statusText}!`);
			} catch (error) {
				toast.error("Erro ao atualizar status do hábito. Tente novamente.");
			}
		}
	};

	const openEditForm = (habit: Habit) => {
		setEditingHabit(habit);
		setIsFormOpen(true);
	};

	const closeForm = () => {
		setIsFormOpen(false);
		setEditingHabit(null);
	};

	const handleRegisterHabit = async (habitId: string, note?: string) => {
		try {
			const result = await registerHabitMutation.mutateAsync({ id: habitId, note });
			const habit = availableHabits.find(h => h.id === habitId);

			toast.success(`Hábito "${habit?.title}" registrado! Total: ${result.currentCount}`);
		} catch (error) {
			toast.error('Erro ao registrar hábito. Tente novamente.');
		}
	};

	return (
		<div className="flex flex-col gap-4 bg-gradient-to-br from-green-50/30 dark:from-green-950/20 to-emerald-50/30 dark:to-emerald-950/20 p-4 border border-green-100/50 dark:border-green-800/30 rounded-xl">
			{/* Header */}
			<Card className="bg-gradient-to-r from-green-50 dark:from-green-900/50 to-blue-50 dark:to-blue-900/50 border-green-200 dark:border-green-700">
				<CardHeader className="pb-3">
					<div className="flex justify-between items-center">
						<div className="flex items-center gap-2">
							<Dumbbell className="w-6 h-6 text-green-600" />
							<CardTitle className="font-bold text-green-900 text-xl">
								Hábitos
							</CardTitle>
						</div>
						<div className="flex items-center gap-2">
							<Button
								onClick={() => setIsFormOpen(true)}
								size="sm"
								className="bg-green-600 hover:bg-green-700 text-white"
							>
								<Plus className="mr-1 w-4 h-4" />
								Novo Hábito
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent className="pt-0">
					<div className="flex justify-between items-center gap-4 text-green-700 text-sm">
						<div className="flex items-center gap-1">
							<TrendingUp className="w-4 h-4" />
							<span>{availableHabits.length} hábitos ativos</span>
						</div>
						<Tooltip>
							<TooltipTrigger asChild>
								<Info className="w-4 h-4 text-green-500 hover:text-green-700 transition-colors cursor-help" />
							</TooltipTrigger>
							<TooltipContent side="bottom" align="end" className="max-w-xs">
								<h1><RefreshCcw className="inline-block mr-1 w-3 h-3" />Foco: consistência</h1>
								<p>Comportamentos repetitivos que você deseja cultivar ou eliminar. São ações realizadas diariamente para criar consistência e disciplina na sua rotina.</p>
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
						<p className="text-blue-600">Carregando hábitos...</p>
					</CardContent>
				</Card>
			)}

			{/* Habits List */}
			<div className="space-y-4">
				{!isLoading && availableHabits.length > 0 && (
					<div className="space-y-3">
						{availableHabits.map((habit) => {
							const stats = habitStats?.[habit.id];
							return (
								<HabitCard
									key={habit.id}
									habit={habit}
									onEdit={openEditForm}
									onStatusChange={handleStatusChange}
									onRegister={handleRegisterHabit}
									currentCount={stats?.currentPeriod?.period.count || 0}
									target={stats?.currentPeriod?.period.target}
									todayCount={stats?.todayEntries || 0}
									streak={stats?.streak}
								/>
							);
						})}
					</div>
				)}

				{!isLoading && totalHabits === 0 && (
					<Card className="bg-gray-50 border-gray-300 border-dashed">
						<CardContent className="py-8 text-center">
							<Dumbbell className="mx-auto mb-3 w-12 h-12 text-gray-400" />
							<h3 className="mb-2 font-medium text-gray-600 text-lg">
								Nenhum hábito definido
							</h3>
							<p className="mb-4 text-gray-500">
								Comece criando seu primeiro hábito para organizar
								sua rotina
							</p>
							<Button
								onClick={() => setIsFormOpen(true)}
								className="bg-green-600 hover:bg-green-700"
							>
								<Plus className="mr-2 w-4 h-4" />
								Criar Primeiro Hábito
							</Button>
						</CardContent>
					</Card>
				)}
			</div>

			{/* Habit Form Modal */}
			<HabitForm
				habit={editingHabit}
				onSubmit={editingHabit ? handleEditHabit : handleCreateHabit}
				onCancel={closeForm}
				open={isFormOpen}
			/>

			{/* Delete Confirmation Dialog */}
			<ConfirmationDialog
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
				title="Confirmar Exclusão"
				description={
					habitToDelete
						? `Tem certeza que deseja excluir o hábito "${habitToDelete.title}"? Esta ação não pode ser desfeita.`
						: "Tem certeza que deseja excluir este hábito?"
				}
				confirmText="Excluir"
				cancelText="Cancelar"
				onConfirm={confirmDeleteHabit}
				variant="destructive"
			/>
		</div>
	);
}
