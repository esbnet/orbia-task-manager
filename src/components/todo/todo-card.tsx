import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Calendar,
	CheckCircle,
	ChevronDown,
	Edit,
	Tag
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Todo } from "../../types";
// import { useTodoContext } from "@/contexts/todo-context";
import { useButtonLoading } from "@/hooks/use-button-loading";
import { useState } from "react";

interface TodoCardProps {
	todo: Todo;
	onEdit?: (todo: Todo) => void;
	onComplete?: (id: string) => Promise<void>;
	onDelete?: (id: string) => void;
	isCompleted?: boolean;
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
	onComplete,
	onDelete,
	isCompleted = false
}: TodoCardProps) {
	// Removido useTodoContext
	const completeLoading = useButtonLoading();
	const [isExpanded, setIsExpanded] = useState(false);
	const difficulty = difficultyConfig[todo.difficulty as keyof typeof difficultyConfig] || difficultyConfig["Fácil"];

	const handleComplete = async () => {
		if (onComplete) {
			await completeLoading.executeAsync(
				async () => {
					// TODO: Implementar mutation para todo-logs quando disponível
					// Por enquanto, apenas chama o callback que já está conectado com a mutation
					await onComplete(todo.id);
				},
				undefined,
				() => toast.error("Erro ao completar tarefa. Tente novamente.")
			);
		}
	};

	return (
		<Card className={`hover:shadow-md transition-shadow duration-200 relative overflow-hidden ${completeLoading.isLoading ? "opacity-50 pointer-events-none" : ""}`}>
			<CardHeader className="pb-1 sm:pb-2">
				{/* Layout MOBILE - Ultra-compacto */}
				<div className="sm:hidden block">
					<div className="flex items-start">
						<div className="flex-1 pr-1 min-w-0">
							<CardTitle className="font-semibold text-gray-900 dark:text-gray-100 text-xs break-words leading-tight">
								{todo.title}
							</CardTitle>
						</div>
						<div className="flex flex-shrink-0 items-center gap-0.5 ml-1">
							{!isCompleted && (
								<Button
									title="Marcar como concluído"
									variant="ghost"
									onClick={handleComplete}
									size="icon"
									className="hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full w-5 h-5 text-blue-600"
									disabled={completeLoading.isLoading}
								>
									{completeLoading.isLoading ? (
										<div className="border-2 border-t-transparent border-blue-600 rounded-full w-2.5 h-2.5 animate-spin" />
									) : (
										<CheckCircle className="w-2.5 h-2.5" />
									)}
								</Button>
							)}

							{onEdit && (
								<Button
									onClick={() => onEdit(todo)}
									variant="ghost"
									size="icon"
									className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full w-5 h-5 text-gray-600"
								>
									<Edit className="w-2.5 h-2.5" />
								</Button>
							)}

							<Button
								size="sm"
								variant="ghost"
								onClick={() => setIsExpanded(!isExpanded)}
								className="p-0 w-5 h-5"
							>
								<ChevronDown className={`w-2.5 h-2.5 transition-all duration-200 ${isExpanded ? "rotate-180" : "rotate-0"}`} />
							</Button>
						</div>
					</div>
				</div>

				{/* Layout DESKTOP - título e botões na mesma linha */}
				<div className="hidden sm:flex justify-between items-start gap-3">
					<div className="flex-1 min-w-0">
						<CardTitle className="pr-2 font-semibold text-gray-900 dark:text-gray-100 text-lg leading-tight">
							{todo.title}
						</CardTitle>
					</div>

					<div className="flex flex-shrink-0 items-center gap-1">
						{!isCompleted && (
							<Button
								title="Marcar como concluído"
								variant="ghost"
								onClick={handleComplete}
								size="icon"
								className="hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full w-8 h-8 text-blue-600 hover:text-blue-600"
								disabled={completeLoading.isLoading}
							>
								{completeLoading.isLoading ? (
									<div className="border-2 border-t-transparent border-blue-600 rounded-full w-4 h-4 animate-spin" />
								) : (
									<CheckCircle className="w-4 h-4" />
								)}
							</Button>
						)}

						{onEdit && (
							<Button
								onClick={() => onEdit(todo)}
								variant="ghost"
								size="icon"
								className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full w-8 h-8 text-gray-600 dark:text-gray-400"
							>
								<Edit className="w-4 h-4" />
							</Button>
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
