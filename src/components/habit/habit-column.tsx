"use client";

import { AlertTriangle, Dumbbell, Plus, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCallback, useState } from "react";
import { useCreateHabit, useDeleteHabit, useHabits, useUpdateHabit } from "@/hooks/use-habits";

import { Badge } from "../ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import type { Habit } from "@/domain/entities/habit";
import { HabitCard } from "./habit-card";
import { HabitForm } from "./habit-form";
import { toast } from "sonner";

export function HabitColumn() {
	const { data: habits = [], isLoading } = useHabits();
	const createHabitMutation = useCreateHabit();
	const updateHabitMutation = useUpdateHabit();
	const deleteHabitMutation = useDeleteHabit();


	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
	const [habitStats, setHabitStats] = useState<Record<string, Habit>>({});

	const inProgressHabits = habits.filter(
		(habit: Habit) => habit.status === "Em Andamento",
	);
	const completedHabits = habits.filter((habit: Habit) => habit.status === "Completo");
	const cancelledHabits = habits.filter(
		(habit: Habit) => habit.status === "Cancelado",
	);

	// Função para carregar estatísticas de um hábito específico
	const loadHabitStats = useCallback(async (habitId: string) => {
		try {
			const response = await fetch(`/api/habits/${habitId}/stats`);
			if (response.ok) {
				const stats = await response.json();
				setHabitStats(prev => ({
					...prev,
					[habitId]: stats,
				}));
			}
		} catch (error) {
		}
	}, []);

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
		const habit = habits.find((h) => h.id === habitId);
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

	const handleRegisterHabit = async (habitId: string, note?: string,) => {
		try {
			const response = await fetch(`/api/habits/${habitId}/register`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ note }),
			});

			if (!response.ok) {
				throw new Error('Failed to register habit');
			}

			const result = await response.json();
			const habit = habits.find(h => h.id === habitId);

			toast.success(`Hábito "${habit?.title}" registrado! Total: ${result.currentCount}`);

			// Carregar estatísticas atualizadas
			await loadHabitStats(habitId);
		} catch (error) {
			toast.error('Erro ao registrar hábito. Tente novamente.');
		}
	};

	return (
		<div className="flex flex-col gap-4">
			{/* Header */}
			<Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
				<CardHeader className="pb-3">
					<div className="flex justify-between items-center">
						<div className="flex items-center gap-2">
							<Dumbbell className="w-6 h-6 text-green-600" />
							<CardTitle className="font-bold text-green-900 text-xl">
								Hábitos
							</CardTitle>
						</div>
						<Button
							onClick={() => setIsFormOpen(true)}
							size="sm"
							className="bg-green-600 hover:bg-green-700 text-white"

						>
							<Plus className="mr-1 w-4 h-4" />
							Novo Hábito
						</Button>
					</div>
				</CardHeader>
				<CardContent className="pt-0">
					<div className="flex items-center gap-4 text-green-700 text-sm">
						<div className="flex items-center gap-1">
							<TrendingUp className="w-4 h-4" />
							<span>{inProgressHabits.length} em andamento</span>
						</div>
						<div className="flex items-center gap-1">
							<AlertTriangle className="w-4 h-4" />
							<span>{cancelledHabits.length} cancelados</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Habits List */}
			<div className="space-y-4">
				{inProgressHabits.length > 0 && (
					<div>
						<h3 className="flex items-center gap-1 mb-2 font-semibold text-green-600 text-sm">
							<Dumbbell className="w-4 h-4" />
							Em Andamento
						</h3>
						<div className="space-y-3">
							{inProgressHabits.map((habit) => {
								const stats = habitStats[habit.id];
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
									/>
								);
							})}
						</div>
					</div>
				)}

				{completedHabits.length > 0 && (
					<div>
						<h3 className="flex items-center gap-1 mb-2 font-semibold text-green-600 text-sm">
							<TrendingUp className="w-4 h-4" />
							Concluídos
						</h3>
						<div className="space-y-3">
							{completedHabits.slice(0, 3).map((habit) => (
								<HabitCard
									key={habit.id}
									habit={habit}
									onEdit={openEditForm}
									onStatusChange={handleStatusChange}
								/>
							))}
							{completedHabits.length > 3 && (
								<div className="py-2 text-center">
									<Badge
										variant="outline"
										className="text-gray-600"
									>
										+{completedHabits.length - 3} hábitos
										concluídos
									</Badge>
								</div>
							)}
						</div>
					</div>
				)}

				{habits.length === 0 && (
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
