"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { memo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import type { Habit } from "@/domain/entities/habit";
import { useButtonLoading } from "@/hooks/use-button-loading";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

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
			className={`transition-all duration-200 hover:shadow-lg overflow-hidden relative ${isOverdue ? "border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-950/20" : ""
				} ${(registerLoading.isLoading || isRegistering) ? "opacity-50 pointer-events-none" : ""}`}
		>
			<CardHeader className="pb-1 sm:pb-2">
				{/* Layout MOBILE - Ultra-compacto */}
				<div className="sm:hidden block">
					<div className="flex items-start">
						<div className="flex-1 pr-1 min-w-0">
							<CardTitle className="font-semibold text-gray-900 dark:text-gray-100 text-xs break-words leading-tight">
								{habit.title}
							</CardTitle>
						</div>
						<div className="flex flex-shrink-0 items-center gap-0.5 ml-1">
							{habit.status === "Em Andamento" && (
								<>
									{/* Botão principal de registro */}
									<Button
										title="Registrar ocorrência"
										size="icon"
										variant="ghost"
										onClick={handleRegister}
										className="hover:bg-green-100 dark:hover:bg-green-900/30 rounded-full w-5 h-5 text-green-600"
										disabled={registerLoading.isLoading || isRegistering}
									>
										{(registerLoading.isLoading || isRegistering) ? (
											<LoaderCircle className="w-2.5 h-2.5 text-green-600 animate-spin" />
										) : (
											<CheckCircle className="w-2.5 h-2.5" />
										)}
									</Button>

									{onEdit && (
										<Button
											title="Editar"
											size="icon"
											variant="ghost"
											onClick={() => onEdit(habit)}
											disabled={editLoading.isLoading}
											className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full w-5 h-5 text-gray-600"
										>
											{editLoading.isLoading ? (
												<div className="border-2 border-t-transparent rounded-full w-2.5 h-2.5 text-gray-400 animate-spin" />
											) : (
												<Edit className="w-2.5 h-2.5" />
											)}
										</Button>
									)}

									{/* Botão de arquivar hábito */}
									<Button
										className="hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full w-5 h-5 text-red-600"
										title="Arquivar hábito"
										size="icon"
										variant="ghost"
										onClick={() => setIsCompleteDialogOpen(true)}
										disabled={completeLoading.isLoading}
									>
										{completeLoading.isLoading ? (
											<LoaderCircle className="w-2.5 h-2.5 text-red-600 animate-spin" />
										) : (
											<Archive className="w-2.5 h-2.5" />
										)}
									</Button>
								</>
							)}

							<Button
								size="sm"
								variant="ghost"
								onClick={() => setIsExpanded(!isExpanded)}
								className="p-0 w-5 h-5"
							>
								{isExpanded ? <ChevronDown className="w-2.5 h-2.5 rotate-180 transition-all duration-200" /> : <ChevronDown className="w-2.5 h-2.5 rotate-0 transition-all duration-200" />}
							</Button>
						</div>
					</div>
				</div>

				{/* Layout DESKTOP - título e botões na mesma linha */}
				<div className="hidden sm:flex justify-between items-start gap-1">
					<div className="flex-1 min-w-0 max-w-[calc(100%-140px)]">
						<CardTitle className="pr-2 font-semibold text-gray-900 dark:text-gray-100 text-base md:text-lg break-words leading-snug">
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
										<LoaderCircle className="w-4 h-4 text-red-600 animate-spin duration-200" />
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
					<div className="space-y-4 pt-4 border-gray-100 dark:border-gray-700 border-t max-w-full overflow-hidden">
						{/* Informações básicas */}
						<div className="space-y-3">
							<div className="font-medium text-gray-700 dark:text-gray-300 text-sm">
								Informações Básicas
							</div>
							<div className="flex flex-wrap items-center gap-2">
								<Badge
									variant="outline"
									className={`${priorityColors[habit.priority]} truncate max-w-20`}
									title={habit.priority}
								>
									{habit.priority}
								</Badge>
								<Badge
									variant="outline"
									className={`${statusColors[habit.status]} flex items-center gap-1 min-w-0`}
								>
									{habit.status === "Em Andamento" && <TrendingUp className="flex-shrink-0 w-3 h-3" />}
									{habit.status === "Completo" && <CheckCircle className="flex-shrink-0 w-3 h-3" />}
									{habit.status === "Cancelado" && <AlertTriangle className="flex-shrink-0 w-3 h-3" />}
									<span className="truncate">{habit.status}</span>
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
										<div className="flex items-center gap-1 min-w-0">
											<TrendingUp className="flex-shrink-0 w-4 h-4" />
											<span className="truncate">Registros: {currentCount}</span>
										</div>
									)}
									{todayCount > 0 && (
										<div className="flex items-center gap-1 min-w-0">
											<Calendar className="flex-shrink-0 w-4 h-4" />
											<span className="truncate">Hoje: {todayCount}</span>
										</div>
									)}
									{streak && streak.currentStreak > 0 && (
										<div className="flex items-center gap-1 min-w-0">
											<span className="flex-shrink-0 text-orange-600 dark:text-orange-400">🔥</span>
											<span className="font-medium text-orange-600 dark:text-orange-400 truncate">{streak.currentStreak} dias</span>
										</div>
									)}
								</div>
							</div>
						)}

						{/* Próximo período disponível */}
						{nextAvailableAt && (
							<div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 text-sm">
								<RotateCcw className="flex-shrink-0 w-4 h-4" />
								<span className="break-words">Disponível em: {format(nextAvailableAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
							</div>
						)}

						{/* Observações */}
						{habit.observations && (
							<div>
								<div className="mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
									Observações
								</div>
								<p className="max-h-20 overflow-hidden text-gray-600 dark:text-gray-400 break-words leading-relaxed">
									{habit.observations.length > 100
										? `${habit.observations.substring(0, 100)}...`
										: habit.observations
									}
								</p>
							</div>
						)}

						{/* Detalhes do hábito */}
						<div className="space-y-3">
							<div className="font-medium text-gray-700 dark:text-gray-300 text-sm">
								Detalhes
							</div>

							<div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
								<Calendar className="flex-shrink-0 w-4 h-4" />
								<span className="break-words">
									Criado em {format(habit.createdAt, "dd 'de' MMMM 'de' yyyy", {
										locale: ptBR,
									})}
								</span>
								{isOverdue && (
									<AlertTriangle className="flex-shrink-0 w-4 h-4 text-red-500 dark:text-red-400" />
								)}
							</div>

							<div className="flex flex-wrap items-center gap-2">
								<Badge className={`text-xs ${difficultyBadge.color} truncate max-w-24`}>
									<span className="flex-shrink-0">{difficultyBadge.stars}</span> <span className="truncate">{habit.difficulty}</span>
								</Badge>
								<Badge className="flex items-center gap-1 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 min-w-0 text-purple-700 dark:text-purple-300 text-xs">
									<RotateCcw className="flex-shrink-0 w-3 h-3" />
									<span className="truncate">{habit.reset}</span>
								</Badge>
							</div>

							{habit.tags.length > 0 && (
								<div className="flex flex-wrap gap-1">
									{habit.tags.slice(0, 3).map((tag) => (
										<Badge
											key={tag}
											variant="secondary"
											className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 max-w-24 text-slate-700 dark:text-slate-300 text-xs truncate"
											title={tag}
										>
											<Tag className="flex-shrink-0 mr-1 w-3 h-3" />
											<span className="truncate">{tag}</span>
										</Badge>
									))}
									{habit.tags.length > 3 && (
										<Badge
											variant="secondary"
											className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs"
										>
											+{habit.tags.length - 3}
										</Badge>
									)}
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
							<span className="break-words">
								{format(habit.updatedAt, "dd/MM/yyyy 'às' HH:mm", {
									locale: ptBR,
								})}
							</span>
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
