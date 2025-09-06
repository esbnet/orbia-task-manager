"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	AlertTriangle,
	Calendar,
	CheckCircle,
	ChevronDown,
	Edit,
	Gauge,
	LoaderCircle,
	RotateCcw,
	Tag,
	TrendingUp
} from "lucide-react";
import { memo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Habit } from "@/domain/entities/habit";
import { useButtonLoading } from "@/hooks/use-button-loading";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const priorityColors = {
	"Baixa": "border-gray-300 text-gray-600",
	"Média": "border-blue-300 text-blue-600",
	"Alta": "border-orange-300 text-orange-600",
	"Urgente": "border-red-300 text-red-600",
};

const statusColors = {
	"Em Andamento": "border-blue-300 text-blue-600",
	"Completo": "border-green-300 text-green-600",
	"Cancelado": "border-gray-300 text-gray-600",
};

interface HabitCardProps {
	habit: Habit;
	onEdit?: (habit: Habit) => void;
	onStatusChange?: (habitId: string, status: Habit["status"]) => void;
	onRegister?: (habitId: string, note?: string) => void;
	currentCount?: number;
	target?: number;
	todayCount?: number;
}

export const HabitCard = memo(function HabitCard({
	habit,
	onEdit,
	onStatusChange,
	onRegister,
	currentCount = 0,
	todayCount = 0,
}: HabitCardProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const [isRegistering, setIsRegistering] = useState(false);
	const registerLoading = useButtonLoading();
	const editLoading = useButtonLoading();
	const isOverdue =
		habit.status === "Em Andamento" && habit.lastCompletedDate && habit.createdAt < new Date();

	const handleStatusChange = (newStatus: Habit["status"]) => {
		onStatusChange?.(habit.id, newStatus);
	};

	const handleRegister = async () => {
		if (isRegistering || registerLoading.isLoading) return;

		setIsRegistering(true);
		try {
			await registerLoading.executeAsync(async () => {
				onRegister?.(habit.id);
			});
		} finally {
			setIsRegistering(false);
		}
	};

	return (
		<Card
			className={`transition-all duration-200 hover:shadow-lg ${isOverdue ? "border-red-300 bg-red-50" : ""
				} ${(registerLoading.isLoading || isRegistering) ? "opacity-50 pointer-events-none" : ""}`}
		>
			<CardHeader >
				<div className="flex justify-between items-start">
					<div className="flex-1">
						<CardTitle className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
							{habit.title}
						</CardTitle>
						<div className="flex items-center gap-2 mt-2">
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
								{habit.status}
							</Badge>
						</div>

						{/* Estatísticas do período atual - Temporariamente simplificado */}
						{(currentCount > 0 || todayCount > 0) && (
							<div className="flex items-center gap-4 mt-2 text-gray-600 text-sm">
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
							</div>
						)}
					</div>

					<div className="flex items-center">
						{habit.status === "Em Andamento" && (
							<>
								{/* Botão principal de registro */}
								<Button
									title="Registrar ocorrência"
									size="sm"
									variant="ghost"
									onClick={handleRegister}
									className="hover:bg-green-100 text-green-600"
									disabled={registerLoading.isLoading || isRegistering}
								>
									{(registerLoading.isLoading || isRegistering) ? (
										<LoaderCircle className="w-4 h-4 animate-spin duration-200" />
									) : (
										<CheckCircle className="w-4 h-4" />
									)}
								</Button>
							</>
						)}

						{onEdit && (
							<Button
								title="Editar"
								size="sm"
								variant="ghost"
								onClick={() => onEdit(habit)}
								disabled={editLoading.isLoading}
							>
								{editLoading.isLoading ? (
									<div className="border-2 border-gray-600 border-t-transparent rounded-full w-4 h-4 animate-spin" />
								) : (
									<Edit className="w-4 h-4" />
								)}
							</Button>
						)}

					</div>
				</div>
			</CardHeader>

			<CardContent className="pt-0">
				<div className="flex justify-between items-center pt-3">
					<div className="text-gray-500 text-xs">
						Criado em{" "}
						{format(habit.createdAt, "dd/MM/yyyy", { locale: ptBR })}
					</div>
					<Button
						size="sm"
						variant="ghost"
						onClick={() => setIsExpanded(!isExpanded)}
					>
						{isExpanded ? <ChevronDown className="rotate-180 transition-all duration-200" /> : <ChevronDown className="rotate-0 transition-all duration-200" />}
					</Button>
				</div>

				{isExpanded && (
					<div className="mt-3 pt-3 border-gray-100 border-t">
						{habit.observations && (
							<p className="mb-3 text-gray-600 dark:text-gray-400">
								{habit.observations}
							</p>
						)}

						<div className="flex items-center gap-2 mb-3 text-gray-500 text-sm" title="data de criação">
							<Calendar className="w-4 h-4" />
							<span>
								{format(habit.createdAt, "dd 'de' MMMM 'de' yyyy", {
									locale: ptBR,
								})}
							</span>
							{isOverdue && (
								<AlertTriangle className="w-4 h-4 text-red-500" />
							)}
						</div>

						<div className="flex items-center gap-2 mb-3 text-gray-500 text-sm">
							<span className="flex gap-2" title="dificuldade"><Gauge className="w-4 h-4" />{habit.difficulty}</span>
							<span>•</span>
							<span className="flex gap-2" title="ciclo de reinício" ><RotateCcw className="w-4 h-4" /> {habit.reset}</span>
						</div>

						{habit.tags.length > 0 && (
							<div className="flex flex-wrap gap-1 my-3">
								{habit.tags.map((tag) => (
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
						<div className="text-gray-600 dark:text-gray-400 text-sm">
							<strong>Última atualização:</strong>{" "}
							{format(habit.updatedAt, "dd/MM/yyyy 'às' HH:mm", {
								locale: ptBR,
							})}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
});
