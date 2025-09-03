"use client";

import { AlertTriangle, Plus, Target, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Goal } from "@/domain/entities/goal";
import { GoalCard } from "./goal-card";
import { GoalForm } from "./goal-form";
import { useGoals } from "@/contexts/goal-context";
import { useState } from "react";

export function GoalColumn() {
	const { goals, loading, error, createGoal, updateGoal, deleteGoal } = useGoals();
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

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
	}) => {
		await createGoal(goalData);
		setIsFormOpen(false);
	};

	const handleEditGoal = async (goalData: {
		title: string;
		description: string;
		targetDate: Date;
		priority: Goal["priority"];
		tags: string[];
	}) => {
		if (editingGoal) {
			await updateGoal(editingGoal.id, goalData);
			setEditingGoal(null);
			setIsFormOpen(false);
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
	};

	return (
		<div className="flex flex-col gap-4">
			{/* Header */}
			<Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
				<CardHeader className="pb-3">
					<div className="flex justify-between items-center">
						<div className="flex items-center gap-2">
							<Target className="w-6 h-6 text-purple-600" />
							<CardTitle className="font-bold text-purple-900 text-xl">
								Metas
							</CardTitle>
						</div>
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
				</CardHeader>
				<CardContent className="pt-0">
					<div className="flex items-center gap-4 text-purple-700 text-sm">
						<div className="flex items-center gap-1">
							<TrendingUp className="w-4 h-4" />
							<span>{inProgressGoals.length} em andamento</span>
						</div>
						<div className="flex items-center gap-1">
							<AlertTriangle className="w-4 h-4" />
							<span>{overdueGoals.length} atrasadas</span>
						</div>
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
							<h3 className="flex items-center gap-1 mb-2 font-semibold text-blue-600 text-sm">
								<Target className="w-4 h-4" />
								Em Andamento
							</h3>
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

					{completedGoals.length > 0 && (
						<div>
							<h3 className="flex items-center gap-1 mb-2 font-semibold text-green-600 text-sm">
								<TrendingUp className="w-4 h-4" />
								Concluídas
							</h3>
							<div className="space-y-3">
								{completedGoals.slice(0, 3).map((goal) => (
									<GoalCard
										key={goal.id}
										goal={goal}
										onEdit={openEditForm}
										onStatusChange={handleStatusChange}
									/>
								))}
								{completedGoals.length > 3 && (
									<div className="py-2 text-center">
										<Badge
											variant="outline"
											className="text-gray-600"
										>
											+{completedGoals.length - 3} metas
											concluídas
										</Badge>
									</div>
								)}
							</div>
						</div>
					)}

					{goals.length === 0 && (
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
			/>
		</div>
	);
}
