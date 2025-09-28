"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	AlertTriangle,
	Calendar,
	CheckCircle,
	ChevronDown,
	Edit,
	Tag,
	XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import type { Goal } from "@/domain/entities/goal";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

interface GoalCardProps {
	goal: Goal;
	onDelete?: (goalId: string) => void;
	onEdit?: (goal: Goal) => void;
	onStatusChange?: (
		goalId: string,
		status: Goal["status"],
	) => void | Promise<void>;
}

const priorityColors: Record<Goal["priority"], string> = {
	LOW: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700",
	MEDIUM: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-700",
	HIGH: "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border border-orange-200 dark:border-orange-700",
	URGENT: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700",
};

const statusColors: Record<Goal["status"], string> = {
	IN_PROGRESS: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-700",
	COMPLETED: "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-200 border border-green-200 dark:border-green-700",
	CANCELLED: "bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700",
};

const priorityLabels: Record<Goal["priority"], string> = {
	LOW: "Baixa",
	MEDIUM: "Média",
	HIGH: "Alta",
	URGENT: "Urgente",
};

const statusLabels: Record<Goal["status"], string> = {
	IN_PROGRESS: "Em andamento",
	COMPLETED: "Concluído",
	CANCELLED: "Cancelado",
};

export function GoalCard({ goal, onEdit, onStatusChange }: GoalCardProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
	const [isCompleting, setIsCompleting] = useState(false);
	const [isCanceling, setIsCanceling] = useState(false);
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
			if (
				Number.isNaN(startDate.getTime()) ||
				Number.isNaN(endDate.getTime())
			) {
				console.warn("Datas inválidas para cálculo de progresso:", {
					createdAt: goal.createdAt,
					targetDate: goal.targetDate,
				});
				return {
					progress: 0,
					background:
						"linear-gradient(to right, #10b981 0%, #f59e0b 50%, #ef4444 100%)",
				};
			}

			const totalTime = endDate.getTime() - startDate.getTime();
			const elapsedTime = now.getTime() - startDate.getTime();

			// Se o tempo total for negativo ou zero, retornar 0%
			if (totalTime <= 0) {
				return {
					progress: 0,
					background:
						"linear-gradient(to right, #10b981 0%, #f59e0b 50%, #ef4444 100%)",
				};
			}

			// Calcular progresso (garantir que fique entre 0 e 100)
			const progress = Math.min(
				Math.max((elapsedTime / totalTime) * 100, 0),
				100,
			);

			// Gradiente dinâmico verde -> amarelo -> vermelho
			const background =
				"linear-gradient(to right, #10b981 0%, #f59e0b 50%, #ef4444 100%)";

			return { progress: Math.round(progress), background };
		} catch (error) {
			console.error("Erro ao calcular progresso:", error);
			return {
				progress: 0,
				background:
					"linear-gradient(to right, #10b981 0%, #f59e0b 50%, #ef4444 100%)",
			};
		}
	};

	const timeProgress = calculateTimeProgress();

	const handleStatusChange = async (newStatus: Goal["status"]) => {
		// Definir qual estado de loading usar baseado na ação
		const setLoading = newStatus === "COMPLETED" ? setIsCompleting : setIsCanceling;

		setLoading(true);
		try {
			if (onStatusChange) {
				await onStatusChange(goal.id, newStatus);
			}
		} catch (error) {
			console.error("Erro ao alterar status da meta:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card
			className={`transition-all duration-200 hover:shadow-lg ${isOverdue ? "border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-950/20" : ""} ${(isCompleting || isCanceling) ? "opacity-50 pointer-events-none" : ""}`}
		>
			<CardHeader className="pb-3">
				<div className="flex justify-between items-start gap-3">
					<div className="flex-1 min-w-0">
						<CardTitle className="pr-2 font-semibold text-gray-900 dark:text-gray-100 text-lg leading-tight">
							{goal.title}
						</CardTitle>
					</div>

					<div className="flex flex-shrink-0 items-center gap-1">
						{goal.status === "IN_PROGRESS" && (
							<>
								<Button
									title="Concluído"
									size="icon"
									variant="ghost"
									onClick={() => handleStatusChange("COMPLETED")}
									className="hover:bg-green-100 dark:hover:bg-green-900/30 rounded-full w-8 h-8 text-green-600 hover:text-green-600"
									disabled={isCompleting}
								>
									{isCompleting ? (
										<div className="border-2 border-green-600 border-t-transparent rounded-full w-4 h-4 animate-spin" />
									) : (
										<CheckCircle className="w-4 h-4" />
									)}
								</Button>
								{onEdit && (
									<Button
										title="Editar"
										size="icon"
										variant="ghost"
										onClick={() => onEdit(goal)}
										className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full w-8 h-8 text-gray-600 dark:text-gray-400"
									>
										<Edit className="w-4 h-4" />
									</Button>
								)}

								<Button
									title="Cancelar"
									size="icon"
									variant="ghost"
									onClick={() => setIsCancelDialogOpen(true)}
									className="hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full w-8 h-8 text-red-600 hover:text-red-600"
									disabled={isCanceling}
								>
									{isCanceling ? (
										<div className="border-2 border-t-transparent border-red-600 rounded-full w-4 h-4 animate-spin" />
									) : (
										<XCircle className="w-4 h-4" />
									)}
								</Button>
							</>
						)}

						{/* Botão para expandir/ocultar detalhes */}
						<Button
							size="sm"
							variant="ghost"
							onClick={() => setIsExpanded(!isExpanded)}
							className="flex-shrink-0 p-0 w-8 h-8"
						>
							<ChevronDown className={`transition-all duration-200 ${isExpanded ? "rotate-180" : "rotate-0"}`} />
						</Button>
					</div>
				</div>
			</CardHeader>

			<CardContent className="pt-0">

				{/* Conteúdo expandido */}
				{isExpanded && (
					<div className="space-y-4 mt-4 pt-4 border-gray-100 dark:border-gray-700 border-t">
						{/* Informações básicas */}
						<div className="space-y-3">
							<div className="font-medium text-gray-700 dark:text-gray-300 text-sm">
								Informações Básicas
							</div>
							{/* Sempre visível - apenas data de criação */}
							<div className="pt-3">
								<Badge
									className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 text-xs"
									title="Data de criação"
								>
									<Calendar className="w-3 h-3" />
									{format(goal.createdAt, "dd/MM/yyyy", { locale: ptBR })}
								</Badge>
							</div>

							<div className="flex flex-wrap items-center gap-2">
								<Badge
									variant="outline"
									className={priorityColors[goal.priority]}
								>
									{priorityLabels[goal.priority]}
								</Badge>
								<Badge
									variant="outline"
									className={statusColors[goal.status]}
								>
									{statusLabels[goal.status]}
								</Badge>
							</div>
						</div>

						{/* Descrição */}
						{goal.description && (
							<div>
								<div className="mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
									Descrição
								</div>
								<p className="text-gray-600 dark:text-gray-400 leading-relaxed">
									{goal.description}
								</p>
							</div>
						)}

						{/* Data da meta */}
						<div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
							<Calendar className="w-4 h-4" />
							<span>
								Meta:{" "}
								{format(
									new Date(goal.targetDate),
									"dd 'de' MMMM 'de' yyyy",
									{
										locale: ptBR,
									},
								)}
							</span>
							{isOverdue && (
								<AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400" />
							)}
						</div>

						{/* Status e progresso para metas em andamento */}
						{goal.status === "IN_PROGRESS" && (
							<>
								<div className="text-gray-600 dark:text-gray-400 text-sm">
									{isOverdue ? (
										<span className="font-medium text-red-600 dark:text-red-400">
											Atrasado há {Math.abs(daysUntilTarget)} dias
										</span>
									) : daysUntilTarget > 0 ? (
										<span className="text-blue-600 dark:text-blue-400">
											Faltam {daysUntilTarget} dias
										</span>
									) : (
										<span className="font-medium text-orange-600 dark:text-orange-400">
											Vence hoje!
										</span>
									)}
								</div>
								<div className="space-y-2">
									<div className="flex justify-between text-gray-500 dark:text-gray-400 text-xs">
										<span>Progresso do tempo</span>
										<span>{timeProgress.progress}%</span>
									</div>
									<div className="relative bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full w-full h-3">
										<div
											className="bg-gradient-to-r from-green-500 to-red-500 rounded-full h-full transition-all duration-300"
											style={{ width: `${timeProgress.progress}%` }}
										/>
									</div>
								</div>
							</>
						)}

						{/* Tags */}
						{goal.tags.length > 0 && (
							<div className="space-y-2">
								<div className="font-medium text-gray-700 dark:text-gray-300 text-sm">
									Tags
								</div>
								<div className="flex flex-wrap gap-1">
									{goal.tags.map((tag) => (
										<Badge
											key={tag}
											variant="secondary"
											className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs"
										>
											<Tag className="mr-1 w-3 h-3" />
											{tag}
										</Badge>
									))}
								</div>
							</div>
						)}

						{/* Última atualização */}
						<div className="pt-2 border-gray-100 dark:border-gray-700 border-t text-gray-600 dark:text-gray-400 text-sm">
							<strong>Última atualização:</strong>{" "}
							{format(goal.updatedAt, "dd/MM/yyyy 'às' HH:mm", {
								locale: ptBR,
							})}
						</div>
					</div>
				)}
			</CardContent>
			<ConfirmationDialog
				open={isCancelDialogOpen}
				onOpenChange={setIsCancelDialogOpen}
				title="Confirmar Cancelamento"
				description="Tem certeza de que deseja cancelar esta meta? Esta ação não pode ser desfeita."
				confirmText="Cancelar Meta"
				cancelText="Manter"
				onConfirm={() => handleStatusChange("CANCELLED")}
				variant="destructive"
			/>
		</Card>
	);
}
