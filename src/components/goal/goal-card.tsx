"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	AlertTriangle,
	Calendar,
	CheckCircle,
	Edit,
	Tag,
	Target,
	XCircle
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Goal } from "@/domain/entities/goal";
import { useButtonLoading } from "@/hooks/use-button-loading";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

interface GoalCardProps {
	goal: Goal;
	onDelete?: (goalId: string) => void;
	onEdit?: (goal: Goal) => void;
	onStatusChange?: (goalId: string, status: Goal["status"]) => void;
}

const priorityColors = {
	LOW: "bg-green-100 text-green-800",
	MEDIUM: "bg-yellow-100 text-yellow-800",
	HIGH: "bg-orange-100 text-orange-800",
	URGENT: "bg-red-100 text-red-800",
};

const statusColors = {
	IN_PROGRESS: "bg-blue-100 text-blue-800",
	COMPLETED: "bg-green-100 text-green-800",
	CANCELLED: "bg-gray-100 text-gray-800",
};

const categoryIcons = {
	PERSONAL: Target,
	WORK: Target,
	HEALTH: Target,
	LEARNING: Target,
};

export function GoalCard({
	goal,
	onEdit,
	onStatusChange,
}: GoalCardProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const statusChangeLoading = useButtonLoading();
	const isOverdue =
		goal.status === "IN_PROGRESS" && new Date(goal.targetDate) < new Date();
	const daysUntilTarget = Math.ceil(
		(new Date(goal.targetDate).getTime() - new Date().getTime()) /
		(1000 * 60 * 60 * 24),
	);

	// Calcular progresso baseado no tempo
	const calculateTimeProgress = () => {
		try {
			const now = new Date();
			const startDate = new Date(goal.createdAt);
			const endDate = new Date(goal.targetDate);

			// Verificar se as datas são válidas
			if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
				console.warn('Datas inválidas para cálculo de progresso:', { createdAt: goal.createdAt, targetDate: goal.targetDate });
				return { progress: 0, background: "linear-gradient(to right, #10b981 0%, #f59e0b 50%, #ef4444 100%)" };
			}

			const totalTime = endDate.getTime() - startDate.getTime();
			const elapsedTime = now.getTime() - startDate.getTime();

			// Se o tempo total for negativo ou zero, retornar 0%
			if (totalTime <= 0) {
				return { progress: 0, background: "linear-gradient(to right, #10b981 0%, #f59e0b 50%, #ef4444 100%)" };
			}

			// Calcular progresso (garantir que fique entre 0 e 100)
			const progress = Math.min(Math.max((elapsedTime / totalTime) * 100, 0), 100);

			// Gradiente dinâmico verde -> amarelo -> vermelho
			const background = "linear-gradient(to right, #10b981 0%, #f59e0b 50%, #ef4444 100%)";

			return { progress: Math.round(progress), background };
		} catch (error) {
			console.error('Erro ao calcular progresso:', error);
			return { progress: 0, background: "linear-gradient(to right, #10b981 0%, #f59e0b 50%, #ef4444 100%)" };
		}
	};

	const timeProgress = calculateTimeProgress();

	const handleStatusChange = async (newStatus: Goal["status"]) => {
		await statusChangeLoading.executeAsync(
			async () => {
				onStatusChange?.(goal.id, newStatus);
			},
			undefined,
			() => console.error("Erro ao alterar status da meta.")
		);
	};

	return (
		<Card
			className={`transition-all duration-200 hover:shadow-lg ${isOverdue ? "border-red-300 bg-red-50" : ""
				}`}
		>
			<CardHeader className="pb-3">
				<div className="flex justify-between items-start">
					<div className="flex-1">
						<CardTitle className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
							{goal.title}
						</CardTitle>
						<div className="flex items-center gap-2 mt-2">
							<Badge
								variant="outline"
								className={priorityColors[goal.priority]}
							>
								{goal.priority === "HIGH" && "Alta"}
								{goal.priority === "MEDIUM" && "Média"}
								{goal.priority === "LOW" && "Baixa"}
								{goal.priority === "URGENT" && "Urgente"}
							</Badge>
							<Badge
								variant="outline"
								className={statusColors[goal.status]}
							>
								{goal.status === "IN_PROGRESS" && "Em andamento"}
								{goal.status === "COMPLETED" && "Concluído"}
								{goal.status === "CANCELLED" && "Cancelado"}
							</Badge>
						</div>
					</div>
					<div className="flex items-center gap-2">
						{goal.status === "IN_PROGRESS" && (
							<>
								<Button
									title="Concluído"
									size="sm"
									variant="ghost"
									onClick={() =>
										handleStatusChange("COMPLETED")
									}
									className="hover:bg-green-50 border-green-200 text-green-600"
									disabled={statusChangeLoading.isLoading}
								>
									{statusChangeLoading.isLoading ? (
										<div className="border-2 border-green-600 border-t-transparent rounded-full w-4 h-4 animate-spin" />
									) : (
										<CheckCircle className="w-4 h-4" />
									)}
								</Button>
								<Button
									title="Cancelar"
									size="sm"
									variant="ghost"
									onClick={() =>
										handleStatusChange("CANCELLED")
									}
									className="hover:bg-gray-50 border-gray-200 text-gray-600"
									disabled={statusChangeLoading.isLoading}
								>
									{statusChangeLoading.isLoading ? (
										<div className="border-2 border-gray-600 border-t-transparent rounded-full w-4 h-4 animate-spin" />
									) : (
										<XCircle className="w-4 h-4" />
									)}
								</Button>
							</>
						)}
						{onEdit && (
							<Button
								title="Editar"
								size="sm"
								variant="ghost"
								onClick={() => onEdit(goal)}
							>
								<Edit className="w-4 h-4" />
							</Button>
						)}

					</div>
				</div>
			</CardHeader>

			<CardContent className="pt-0">
				{goal.description && (
					<p className="mb-3 text-gray-600 dark:text-gray-400">
						{goal.description}
					</p>
				)}

				<div className="flex items-center gap-2 mb-3 text-gray-500 text-sm">
					<Calendar className="w-4 h-4" />
					<span>
						Meta:{" "}
						{format(new Date(goal.targetDate), "dd 'de' MMMM 'de' yyyy", {
							locale: ptBR,
						})}
					</span>
					{isOverdue && (
						<AlertTriangle className="w-4 h-4 text-red-500" />
					)}
				</div>

				{goal.status === "IN_PROGRESS" && (
					<>
						<div className="text-gray-600 dark:text-gray-400 text-sm">
							{isOverdue ? (
								<span className="font-medium text-red-600">
									Atrasado há {Math.abs(daysUntilTarget)} dias
								</span>
							) : daysUntilTarget > 0 ? (
								<span className="text-blue-600">
									Faltam {daysUntilTarget} dias
								</span>
							) : (
								<span className="font-medium text-orange-600">
									Vence hoje!
								</span>
							)}
						</div>
						<div className="mt-4">
							<div className="flex justify-between mb-2 text-gray-500 text-xs">
								<span>Progresso do tempo</span>
							</div>
							<div className="relative bg-gradient-to-r from-green-600 via-yellow-600 to-red-600 border border-gray-300 rounded-full w-full h-3">
								{/* Marca indicando o ponto atual */}
								<div
									className="top-0 bottom-0 absolute flex flex-col justify-center items-center text-center"
									style={{ left: `${timeProgress.progress}%` }}
								>
									<p className="flex justify-center items-center bg-gray-400 rounded-full outline-1 outline-amber-50 w-1 h-1 font-thin text-gray-600 dark:text-gray-200 text-xs" >
										<span className="-mt-5">{timeProgress.progress}%</span></p>
								</div>
							</div>
						</div>
					</>
				)}

				{goal.tags.length > 0 && (
					<div className="flex flex-wrap gap-1 mt-3">
						{goal.tags.map((tag) => (
							<Badge
								key={tag}
								variant="secondary"
								className="text-xs"
							>
								<Tag className="mr-1 w-3 h-3" />
								{tag}
							</Badge>
						))}
					</div>
				)}

				<div className="flex justify-between items-center mt-4 pt-3 border-gray-100 border-t">
					<div className="text-gray-500 text-xs">
						Criado em{" "}
						{format(goal.createdAt, "dd/MM/yyyy", { locale: ptBR })}
					</div>
					<Button
						size="sm"
						variant="ghost"
						onClick={() => setIsExpanded(!isExpanded)}
					>
						{isExpanded ? "Ver menos" : "Ver mais"}
					</Button>
				</div>

				{isExpanded && (
					<div className="mt-3 pt-3 border-gray-100 border-t">
						<div className="text-gray-600 dark:text-gray-400 text-sm">
							<strong>Última atualização:</strong>{" "}
							{format(goal.updatedAt, "dd/MM/yyyy 'às' HH:mm", {
								locale: ptBR,
							})}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
