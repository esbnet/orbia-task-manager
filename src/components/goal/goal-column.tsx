"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger
} from "@/components/ui/tooltip";
import { AlertTriangle, Info, Plus, Target, TargetIcon, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useGoals } from "@/contexts/goal-context";
import type { Goal } from "@/domain/entities/goal";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { GoalCard } from "./goal-card";
import { GoalForm } from "./goal-form";

export function GoalColumn() {
	const { goals, loading, error, createGoal, updateGoal, deleteGoal } = useGoals();
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const queryClient = useQueryClient();

	const inProgressGoals = goals.filter(
		(goal) => goal.status === "IN_PROGRESS",
	);
	const completedGoals = goals.filter((goal) => goal.status === "COMPLETED");
	const overdueGoals = goals.filter(
		(goal) => goal.status === "IN_PROGRESS" && new Date(goal.targetDate) < new Date(),
	);

	const handleCreateGoal = async (goalData: {
		title: string;
		description: string;
		targetDate: Date;
		priority: Goal["priority"];
		tags: string[];
		attachedTasks?: Array<{ taskId: string; taskType: "habit" | "daily" | "todo" }>;
	}) => {
		setIsSaving(true);
		try {
			await createGoal(goalData);
			setIsFormOpen(false);
			setEditingGoal(null);
		} catch (error) {
			console.error("Erro ao criar meta:", error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleEditGoal = async (goalData: {
		title: string;
		description: string;
		targetDate: Date;
		priority: Goal["priority"];
		tags: string[];
		attachedTasks?: Array<{ taskId: string; taskType: "habit" | "daily" | "todo" }>;
	}) => {
		if (editingGoal) {
			setIsSaving(true);
			try {
				// Para edição, precisamos converter GoalFormData para Partial<Goal>
				const updateData: Partial<Goal> = {
					title: goalData.title,
					description: goalData.description,
					targetDate: goalData.targetDate,
					priority: goalData.priority,
					tags: goalData.tags,
				};

				await updateGoal(editingGoal.id, updateData);

				// Se houver tarefas anexadas, atualizar separadamente
				if (goalData.attachedTasks && goalData.attachedTasks.length > 0) {
					try {
						// TODO: Implementar mutation para attached tasks quando disponível
						// Por enquanto, apenas invalidar o cache das tarefas anexadas
						queryClient.invalidateQueries({ queryKey: ["attached-tasks", editingGoal.id] });
					} catch (error) {
						console.error("Erro ao atualizar tarefas anexadas:", error);
					}
				}

				setEditingGoal(null);
				setIsFormOpen(false);
			} catch (error) {
				console.error("Erro ao editar meta:", error);
			} finally {
				setIsSaving(false);
			}
		}
	};
	const handleDeleteGoal = async (goalId: string) => {
		await deleteGoal(goalId);
	};

	const handleStatusChange = async (
		goalId: string,
		status: Goal["status"],
	) => {
		const goal = goals.find((g) => g.id === goalId);
		if (goal) {
			await updateGoal(goalId, { status });
		}
	};

	const openEditForm = (goal: Goal) => {
		setEditingGoal(goal);
		setIsFormOpen(true);
	};
	const closeForm = () => {
		setIsFormOpen(false);
		setEditingGoal(null);
		setIsSaving(false);
	};

	return (
		<div className="flex flex-col gap-4 bg-gradient-to-br from-purple-50/30 dark:from-purple-950/20 to-indigo-50/30 dark:to-indigo-950/20 p-4 border border-purple-100/50 dark:border-purple-800/30 rounded-xl">
			{/* Header */}
			<Card className="bg-gradient-to-r from-purple-50 dark:from-purple-900/50 to-blue-50 dark:to-blue-900/50 border-purple-200 dark:border-purple-700">
				<CardHeader className="pb-3">
					<div className="flex justify-between items-center">
						<div className="flex items-center gap-2">
							<Target className="w-6 h-6 text-purple-600" />
							<CardTitle className="font-bold text-purple-900 text-xl">
								Metas
							</CardTitle>
						</div>
						<div className="flex items-center gap-2">
							<Button
								onClick={() => {
									setEditingGoal(null);
									setIsFormOpen(true);
								}}
								size="sm"
								className="bg-purple-600 hover:bg-purple-700 text-white"
							>
								<Plus className="mr-1 w-4 h-4" />
								Nova Meta
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent className="pt-0">
					<div className="flex justify-between items-center gap-4 text-purple-700 text-sm">
						<div className="flex items-center gap-1">
							<TrendingUp className="w-4 h-4" />
							<span>{inProgressGoals.length} em andamento</span>
						</div>
						<div className="flex items-center gap-1">
							<AlertTriangle className="w-4 h-4" />
							<span>{overdueGoals.length} atrasadas</span>
						</div>
						<Tooltip>
							<TooltipTrigger asChild>
								<Info className="w-4 h-4 text-purple-500 hover:text-purple-700 transition-colors cursor-help" />
							</TooltipTrigger>
							<TooltipContent side="bottom" align="end" className="max-w-xs">
								<h1><TargetIcon className="inline-block mr-1 w-3 h-3" />Foco: objetivo</h1>
								<p>Objetivos de longo prazo com data específica para conclusão. São projetos maiores que requerem planejamento, acompanhamento e podem estar associados a hábitos, tarefas diárias ou tarefa.</p>
							</TooltipContent>
						</Tooltip>

					</div>
				</CardContent>
			</Card>

			{/* Loading State */}
			{loading && (
				<Card className="bg-blue-50 border-blue-200">
					<CardContent className="py-8 text-center">
						<div className="mx-auto mb-3 border-4 border-t-transparent border-blue-600 rounded-full w-8 h-8 animate-spin"></div>
						<p className="text-blue-600">Carregando metas...</p>
					</CardContent>
				</Card>
			)}

			{/* Error State */}
			{error && (
				<Card className="bg-red-50 border-red-200">
					<CardContent className="py-8 text-center">
						<AlertTriangle className="mx-auto mb-3 w-8 h-8 text-red-500" />
						<p className="text-red-600">Erro ao carregar metas: {error}</p>
					</CardContent>
				</Card>
			)}

			{/* Goals List */}
			{!loading && !error && (
				<div className="space-y-4">
					{overdueGoals.length > 0 && (
						<div>
							<h3 className="flex items-center gap-1 mb-2 font-semibold text-red-600 text-sm">
								<AlertTriangle className="w-4 h-4" />
								Metas Atrasadas
							</h3>
							<div className="space-y-3">
								{overdueGoals.map((goal) => (
									<GoalCard
										key={goal.id}
										goal={goal}
										onEdit={openEditForm}
										onDelete={handleDeleteGoal}
										onStatusChange={handleStatusChange}
									/>
								))}
							</div>
						</div>
					)}

					{inProgressGoals.length > 0 && (
						<div>
							{/* <h3 className="flex items-center gap-1 mb-2 font-semibold text-blue-600 text-sm">
								<Target className="w-4 h-4" />
								Em Andamento
							</h3> */}
							<div className="space-y-3">
								{inProgressGoals
									.filter((goal) => new Date(goal.targetDate) >= new Date())
									.map((goal) => (
										<GoalCard
											key={goal.id}
											goal={goal}
											onEdit={openEditForm}
											onStatusChange={handleStatusChange}
										/>
									))}
							</div>
						</div>
					)}

					{/* Mostrar card de "nenhuma meta" quando não há metas ativas (em andamento ou atrasadas) */}
					{(inProgressGoals.length === 0 && overdueGoals.length === 0) && (
						<Card className="bg-gray-50 border-gray-300 border-dashed">
							<CardContent className="py-8 text-center">
								<Target className="mx-auto mb-3 w-12 h-12 text-gray-400" />
								<h3 className="mb-2 font-medium text-gray-600 text-lg">
									Nenhuma meta definida
								</h3>
								<p className="mb-4 text-gray-500">
									Comece criando sua primeira meta para organizar
									seus objetivos
								</p>
								<Button
									onClick={() => {
										setEditingGoal(null);
										setIsFormOpen(true);
									}}
									className="bg-purple-600 hover:bg-purple-700"
								>
									<Plus className="mr-2 w-4 h-4" />
									Criar Primeira Meta
								</Button>
							</CardContent>
						</Card>
					)}
				</div>
			)}

			{/* Goal Form Modal */}
			<GoalForm
				goal={editingGoal}
				onSubmit={editingGoal ? handleEditGoal : handleCreateGoal}
				onCancel={closeForm}
				open={isFormOpen}
				isLoading={isSaving}
			/>
		</div>
	);
}
