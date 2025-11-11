import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Calendar,
	CheckCircle,
	ChevronDown,
	Edit,
	LoaderCircle,
	Tag
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Todo } from "@/domain/entities/todo";
import { useCompleteTodo, useIncompleteTodo } from "@/hooks/use-complete-todo";
import { useState } from "react";

interface TodoCardProps {
	todo: Todo;
	onEdit?: (todo: Todo) => void;
	onDelete?: (id: string) => void;
}

const difficultyConfig = {
	"Trivial": { color: "bg-gray-50/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 border border-gray-200/80 dark:border-gray-600", stars: "⭐" },
	"Fácil": { color: "bg-green-50/80 dark:bg-green-900/30 text-green-700 dark:text-green-200 border border-green-200/80 dark:border-green-700", stars: "⭐⭐" },
	"Médio": { color: "bg-yellow-50/80 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border border-yellow-200/80 dark:border-yellow-700", stars: "⭐⭐⭐" },
	"Difícil": { color: "bg-red-50/80 dark:bg-red-900/30 text-red-700 dark:text-red-200 border border-red-200/80 dark:border-red-700", stars: "⭐⭐⭐⭐" },
};

const statusConfig = {
	completed: "bg-green-50/80 dark:bg-green-900/30 text-green-700 dark:text-green-200 border border-green-200/80 dark:border-green-700",
	pending: "bg-blue-50/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 border border-blue-200/80 dark:border-blue-700",
};

export function TodoCard({
	todo,
	onEdit,
	onDelete
}: TodoCardProps) {
	const completeTodo = useCompleteTodo();
	const incompleteTodo = useIncompleteTodo();
	const [isExpanded, setIsExpanded] = useState(false);
	const difficulty = difficultyConfig[todo.difficulty as keyof typeof difficultyConfig] || difficultyConfig["Fácil"];

	// Determinar se a tarefa está completa baseado na recorrência
	const isCompleted = (() => {
		if (!todo.lastCompletedDate) return false;
		
		const lastCompleted = new Date(todo.lastCompletedDate);
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		lastCompleted.setHours(0, 0, 0, 0);

		switch (todo.recurrence) {
			case "daily":
				return lastCompleted.getTime() === today.getTime();
			case "weekly": {
				const weekStart = new Date(today);
				weekStart.setDate(today.getDate() - today.getDay());
				return lastCompleted >= weekStart;
			}
			case "monthly": {
				return lastCompleted.getMonth() === today.getMonth() && 
					   lastCompleted.getFullYear() === today.getFullYear();
			}
			case "custom": {
				const daysDiff = Math.floor((today.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24));
				return daysDiff < (todo.recurrenceInterval || 1);
			}
			default: // "none" ou pontual
				return !!todo.lastCompletedDate;
		}
	})();

	// Determinar se a tarefa deve aparecer (não está no período de cooldown)
	const shouldShow = (() => {
		if (todo.recurrence === "none" || todo.todoType.isPontual()) {
			return !todo.lastCompletedDate; // Tarefas pontuais desaparecem após conclusão
		}
		return true; // Tarefas recorrentes sempre aparecem
	})();

	if (!shouldShow) return null;

	const handleComplete = () => {
		completeTodo.mutate(todo);
	};

	const handleIncomplete = () => {
		incompleteTodo.mutate(todo.id);
	};

	const isLoading = completeTodo.isPending || incompleteTodo.isPending;

	return (
		<Card className={`hover:shadow-md gap-0 transition-shadow duration-200 relative overflow-hidden border border-gray-200/50 dark:border-gray-700/50 ${isLoading ? "opacity-50 pointer-events-none" : ""}`}>
			{/* Barra de controles fixa no canto superior direito */}
			<div className="absolute top-2 right-2 flex items-center gap-1 z-10">
				{isCompleted ? (
					<Button
						title="Desmarcar como concluído"
						variant="ghost"
						onClick={handleIncomplete}
						size="icon"
						className="hover:bg-orange-100 dark:hover:bg-orange-900/30 border border-orange-200/50 dark:border-orange-700/50 p-2 rounded-full w-7 h-7 text-orange-600"
						disabled={isLoading}
					>
						{isLoading ? (
							<LoaderCircle className="w-3 h-3 text-orange-600 animate-spin" />
						) : (
							<CheckCircle className="opacity-50 w-3 h-3" />
						)}
					</Button>
				) : (
					<Button
						title="Marcar como concluído"
						variant="ghost"
						onClick={handleComplete}
						size="icon"
						className="hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200/50 dark:border-blue-700/50 p-2 rounded-full w-7 h-7 text-blue-600"
						disabled={isLoading}
					>
						{isLoading ? (
							<LoaderCircle className="w-3 h-3 text-blue-600 animate-spin" />
						) : (
							<CheckCircle className="opacity-50 w-3 h-3" />
						)}
					</Button>
				)}

				{onEdit && (
					<Button
						onClick={() => onEdit(todo)}
						variant="ghost"
						size="icon"
						className="hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200/50 dark:border-gray-600/50 p-2 rounded-full w-7 h-7 text-gray-600"
					>
						<Edit className="w-3 h-3" />
					</Button>
				)}

				<Button
					size="sm"
					variant="ghost"
					onClick={() => setIsExpanded(!isExpanded)}
					className="border border-gray-200/50 dark:border-gray-600/50 p-0 w-7 h-7"
				>
					<ChevronDown className={`w-3 h-3 transition-all duration-200 ${isExpanded ? "rotate-180" : "rotate-0"}`} />
				</Button>
			</div>
			<CardHeader className="pb-0">
				<div className="pr-20">
					<CardTitle className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base break-words leading-snug">
						{todo.title}
					</CardTitle>
				</div>
			</CardHeader>

			<CardContent className="py-0">
				{/* Conteúdo expandido */}
				{isExpanded && (
					<div className="space-y-4 pt-4 border-gray-100 dark:border-gray-700 border-t max-w-full overflow-hidden">
						{/* Informações básicas */}
						<div className="space-y-3">
							<div className="font-medium text-gray-700 dark:text-gray-300 text-sm">
								Informações Básicas
							</div>
							<div className="pt-3">
								<Badge
									className="bg-indigo-50/80 dark:bg-indigo-900/30 border border-indigo-200/80 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 text-xs"
									title="Data de criação"
								>
									<Calendar className="w-3 h-3" />
									{new Date(todo.createdAt).toLocaleDateString('pt-BR')}
								</Badge>
							</div>

							<div className="flex flex-wrap items-center gap-2">
								<Badge className={`text-xs ${difficulty.color}`} title="Dificuldade">
									{difficulty.stars} {todo.difficulty}
								</Badge>

								<Badge
									className={`text-xs ${statusConfig[isCompleted ? 'completed' : 'pending']} dark:text-gray-300`}
									title="Status"
								>
									<CheckCircle className="w-3 h-3" />
									{isCompleted ? "Concluído" : "Em andamento"}
								</Badge>

								{todo.startDate && (
									<Badge className="bg-indigo-50/80 dark:bg-indigo-900/30 border border-indigo-200/80 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 text-xs" title="Data de início">
										<Calendar className="w-3 h-3" />
										{new Date(todo.startDate).toLocaleDateString()}
									</Badge>
								)}

								{todo.recurrence !== "none" && (
									<Badge className="bg-blue-50/80 dark:bg-blue-900/30 border border-blue-200/80 dark:border-blue-700 text-blue-700 dark:text-blue-300 text-xs" title="Tipo de recorrência">
										<div className="bg-blue-500 mr-1 rounded-full w-2 h-2" />
										{(() => {
											switch (todo.recurrence) {
												case "daily": return "Diária";
												case "weekly": return "Semanal";
												case "monthly": return "Mensal";
												case "custom": return `A cada ${todo.recurrenceInterval} dia${todo.recurrenceInterval !== 1 ? 's' : ''}`;
												default: return todo.recurrence;
											}
										})()}
									</Badge>
								)}
							</div>
						</div>

						{/* Observações */}
						{todo.observations && (
							<div>
								<div className="mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
									Observações
								</div>
								<p className="text-gray-600 dark:text-gray-400 leading-relaxed">
									{todo.observations}
								</p>
							</div>
						)}

						{/* Tags */}
						{todo.tags && todo.tags.length > 0 && (
							<div className="space-y-2">
								<div className="font-medium text-gray-700 dark:text-gray-300 text-sm">
									Tags
								</div>
								<div className="flex flex-wrap gap-1">
									{todo.tags.slice(0, 3).map((tag) => (
										<Badge
											key={tag}
											variant="secondary"
											className="bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs"
										>
											<Tag className="mr-1 w-3 h-3" />
											{tag}
										</Badge>
									))}
									{todo.tags.length > 3 && (
										<Badge variant="outline" className="bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs">
											+{todo.tags.length - 3}
										</Badge>
									)}
								</div>
							</div>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
