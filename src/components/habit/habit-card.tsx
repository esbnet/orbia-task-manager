"use client";

import {
	AlertTriangle,
	Archive,
	Calendar,
	CheckCircle,
	ChevronDown,
	Edit,
	LoaderCircle,
	RotateCcw,
	Tag,
	TrendingUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { memo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import type { Habit } from "@/domain/entities/habit";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { useButtonLoading } from "@/hooks/use-button-loading";

const priorityColors = {
	"Baixa": "border-gray-300 text-gray-600",
	"Média": "border-blue-300 text-blue-600",
	"Alta": "border-orange-300 text-orange-600",
	"Urgente": "border-red-300 text-red-600",
};

const statusColors = {
	"Em Andamento": "bg-blue-50 text-blue-700 border border-blue-200",
	"Completo": "bg-green-50 text-green-700 border border-green-200",
	"Cancelado": "bg-gray-50 text-gray-700 border border-gray-200",
};

type DifficultyLevel = "Trivial" | "Fácil" | "Médio" | "Difícil";

interface DifficultyConfig {
	color: string;
	stars: string;
}

const difficultyConfig: Record<DifficultyLevel, DifficultyConfig> = {
	"Trivial": { color: "bg-gray-50 text-gray-700 border border-gray-200", stars: "⭐" },
	"Fácil": { color: "bg-green-50 text-green-700 border border-green-200", stars: "⭐⭐" },
	"Médio": { color: "bg-yellow-50 text-yellow-800 border border-yellow-200", stars: "⭐⭐⭐" },
	"Difícil": { color: "bg-red-50 text-red-700 border border-red-200", stars: "⭐⭐⭐⭐" },
};

interface HabitCardProps {
	habit: Habit;
	onEdit?: (habit: Habit) => void;
	onStatusChange?: (habitId: string, status: Habit["status"]) => void;
	onRegister?: (habitId: string, note?: string) => void | Promise<void>;
	currentCount?: number;
	target?: number;
	todayCount?: number;
	nextAvailableAt?: Date;
	streak?: {
		currentStreak: number;
		longestStreak: number;
		isActiveToday: boolean;
	};
}

export const HabitCard = memo(function HabitCard({
	habit,
	onEdit,
	onStatusChange,
	onRegister,
	currentCount = 0,
	todayCount = 0,
	nextAvailableAt,
	streak,
}: HabitCardProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const [isRegistering, setIsRegistering] = useState(false);
	const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
	const registerLoading = useButtonLoading();
	const editLoading = useButtonLoading();
	const completeLoading = useButtonLoading();
	const isOverdue =
		habit.status === "Em Andamento" && habit.lastCompletedDate && habit.createdAt < new Date();

	const difficultyBadge =
		difficultyConfig[habit.difficulty as DifficultyLevel] ||
		difficultyConfig["Fácil"];

	const handleStatusChange = (newStatus: Habit["status"]) => {
		onStatusChange?.(habit.id, newStatus);
	};

	const handleRegister = async () => {
		if (isRegistering || registerLoading.isLoading) return;

		setIsRegistering(true);
		try {
			await registerLoading.executeAsync(async () => {
				if (onRegister) {
					await onRegister(habit.id);
				}
			});
		} finally {
			setIsRegistering(false);
		}
	};

	const handleComplete = async () => {
		if (completeLoading.isLoading) return;

		try {
			await completeLoading.executeAsync(async () => {
				// Chama o callback que já está conectado com a mutation no habit-column
				await onStatusChange?.(habit.id, "Completo");
			});
			toast.success(`Hábito "${habit.title}" arquivado com sucesso!`);
		} catch (error) {
			toast.error("Erro ao arquivar hábito. Tente novamente.");
		}
	};

	return (
		<Card
			className={`transition-all duration-200 hover:shadow-lg ${isOverdue ? "border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-950/20" : ""
				} ${(registerLoading.isLoading || isRegistering) ? "opacity-50 pointer-events-none" : ""}`}
		>
			<CardHeader className="">
				<div className="flex justify-between items-start gap-3">
					<div className="flex-1 min-w-0">
						<CardTitle className="pr-2 font-semibold text-gray-900 dark:text-gray-100 text-lg leading-tight">
							{habit.title}
						</CardTitle>
					</div>

					<div className="flex flex-shrink-0 items-center gap-1">
						{habit.status === "Em Andamento" && (
							<>
								{/* Botão principal de registro */}
								<Button
									title="Registrar ocorrência"
									size="icon"
									variant="ghost"
									onClick={handleRegister}
									className="hover:bg-green-100 rounded-full w-8 h-8 text-green-600 hover:text-green-600"
									disabled={registerLoading.isLoading || isRegistering}
								>
									{(registerLoading.isLoading || isRegistering) ? (
										<LoaderCircle className="w-4 h-4 animate-spin duration-200" />
									) : (
										<CheckCircle className="w-4 h-4" />
									)}
								</Button>

								{onEdit && (
									<Button
										title="Editar"
										size="icon"
										variant="ghost"
										onClick={() => onEdit(habit)}
										disabled={editLoading.isLoading}
										className="hover:bg-gray-100 rounded-full w-8 h-8 text-gray-600"
									>
										{editLoading.isLoading ? (
											<div className="border-2 border-t-transparent rounded-full w-4 h-4 text-gray-400 animate-spin" />
										) : (
											<Edit className="w-4 h-4" />
										)}
									</Button>
								)}

								{/* Botão de arquivar hábito */}
								<Button
									className="hover:bg-red-100 rounded-full w-8 h-8 text-red-600 hover:text-red-600"
									title="Arquivar hábito"
									size="icon"
									variant="ghost"
									onClick={() => setIsCompleteDialogOpen(true)}
									disabled={completeLoading.isLoading}
								>
									{completeLoading.isLoading ? (
										<LoaderCircle className="border-2 border-t-transparent w-4 h-4 text-red-600 animate-spin duration-200" />
									) : (
										<Archive className="w-4 h-4" />
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
							{isExpanded ? <ChevronDown className="rotate-180 transition-all duration-200" /> : <ChevronDown className="rotate-0 transition-all duration-200" />}
						</Button>
					</div>
				</div>
			</CardHeader>

			<CardContent className="pt-0">
				{/* Conteúdo expandido */}
				{isExpanded && (
					<div className="space-y-4 pt-4 border-gray-100 dark:border-gray-700 border-t">
						{/* Informações básicas */}
						<div className="space-y-3">
							<div className="font-medium text-gray-700 dark:text-gray-300 text-sm">
								Informações Básicas
							</div>
							<div className="flex flex-wrap items-center gap-2">
								<Badge
									variant="outline"
									className={priorityColors[habit.priority]}
								>
									{habit.priority}
								</Badge>
								<Badge
									variant="outline"
									className={statusColors[habit.status]}
								>
									{habit.status === "Em Andamento" && <TrendingUp className="w-3 h-3" />}
									{habit.status === "Completo" && <CheckCircle className="w-3 h-3" />}
									{habit.status === "Cancelado" && <AlertTriangle className="w-3 h-3" />}
									{habit.status}
								</Badge>
							</div>
						</div>

						{/* Estatísticas do período atual */}
						{(currentCount > 0 || todayCount > 0 || streak) && (
							<div className="space-y-2">
								<div className="font-medium text-gray-700 dark:text-gray-300 text-sm">
									Atividade Atual
								</div>
								<div className="flex flex-wrap gap-3 text-gray-600 text-sm">
									{currentCount > 0 && (
										<div className="flex items-center gap-1">
											<TrendingUp className="w-4 h-4" />
											<span>Registros: {currentCount}</span>
										</div>
									)}
									{todayCount > 0 && (
										<div className="flex items-center gap-1">
											<Calendar className="w-4 h-4" />
											<span>Hoje: {todayCount}</span>
										</div>
									)}
									{streak && streak.currentStreak > 0 && (
										<div className="flex items-center gap-1">
											<span className="text-orange-600 dark:text-orange-400">🔥</span>
											<span className="font-medium text-orange-600 dark:text-orange-400">{streak.currentStreak} dias</span>
										</div>
									)}
								</div>
							</div>
						)}

						{/* Próximo período disponível */}
						{nextAvailableAt && (
							<div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 text-sm">
								<RotateCcw className="w-4 h-4" />
								<span>Disponível em: {format(nextAvailableAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
							</div>
						)}

						{/* Observações */}
						{habit.observations && (
							<div>
								<div className="mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
									Observações
								</div>
								<p className="text-gray-600 dark:text-gray-400 leading-relaxed">
									{habit.observations}
								</p>
							</div>
						)}

						{/* Detalhes do hábito */}
						<div className="space-y-3">
							<div className="font-medium text-gray-700 dark:text-gray-300 text-sm">
								Detalhes
							</div>

							<div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
								<Calendar className="w-4 h-4" />
								<span>
									Criado em {format(habit.createdAt, "dd 'de' MMMM 'de' yyyy", {
										locale: ptBR,
									})}
								</span>
								{isOverdue && (
									<AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400" />
								)}
							</div>

							<div className="flex items-center gap-2">
								<Badge className={`text-xs ${difficultyBadge.color}`}>
									{difficultyBadge.stars} {habit.difficulty}
								</Badge>
								<Badge className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 text-xs">
									<RotateCcw className="w-3 h-3" /> {habit.reset}
								</Badge>
							</div>

							{habit.tags.length > 0 && (
								<div className="flex flex-wrap gap-1">
									{habit.tags.map((tag) => (
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
							)}
						</div>

						{/* Estatísticas de streak */}
						{streak && (
							<div className="bg-orange-50 dark:bg-orange-900/20 p-3 border border-orange-200 dark:border-orange-800 rounded-lg">
								<div className="flex justify-between items-center mb-2">
									<span className="font-medium text-orange-800 dark:text-orange-200">Sequência</span>
									{streak.isActiveToday && (
										<Badge className="bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200 text-xs">
											Ativo hoje
										</Badge>
									)}
								</div>
								<div className="flex items-center gap-4 text-sm">
									<div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
										<span>🔥</span>
										<span>Atual: <strong className="text-orange-600 dark:text-orange-400">{streak.currentStreak}</strong></span>
									</div>
									<div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
										<span>🏆</span>
										<span>Recorde: <strong className="text-orange-600 dark:text-orange-400">{streak.longestStreak}</strong></span>
									</div>
								</div>
							</div>
						)}

						{/* Última atualização */}
						<div className="pt-2 border-gray-100 dark:border-gray-700 border-t text-gray-600 dark:text-gray-400 text-sm">
							<strong>Última atualização:</strong>{" "}
							{format(habit.updatedAt, "dd/MM/yyyy 'às' HH:mm", {
								locale: ptBR,
							})}
						</div>
					</div>
				)}
			</CardContent>

			<ConfirmationDialog
				open={isCompleteDialogOpen}
				onOpenChange={setIsCompleteDialogOpen}
				title="Arquivar Hábito"
				description={`Tem certeza que deseja arquivar o hábito "${habit.title}" definitivamente? Esta ação não pode ser desfeita.`}
				confirmText="Arquivar"
				cancelText="Cancelar"
				onConfirm={handleComplete}
				variant="destructive"
			/>
		</Card>
	);
});
