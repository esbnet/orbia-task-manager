import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
	Calendar,
	CheckCircle,
	Edit,
	Tag
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Todo } from "../../types";
// import { useTodoContext } from "@/contexts/todo-context";
import { useButtonLoading } from "@/hooks/use-button-loading";

interface TodoCardProps {
	todo: Todo;
	onEdit?: (todo: Todo) => void;
	onComplete?: (id: string) => Promise<void>;
	onDelete?: (id: string) => void;
	isCompleted?: boolean;
}

const difficultyConfig = {
	"Trivial": { color: "bg-gray-50 text-gray-700 border border-gray-200", stars: "⭐" },
	"Fácil": { color: "bg-green-50 text-green-700 border border-green-200", stars: "⭐⭐" },
	"Médio": { color: "bg-yellow-50 text-yellow-800 border border-yellow-200", stars: "⭐⭐⭐" },
	"Difícil": { color: "bg-red-50 text-red-700 border border-red-200", stars: "⭐⭐⭐⭐" },
};

const statusConfig = {
	completed: "bg-green-50 text-green-700 border border-green-200",
	pending: "bg-blue-50 text-blue-700 border border-blue-200",
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
	const difficulty = difficultyConfig[todo.difficulty as keyof typeof difficultyConfig] || difficultyConfig["Fácil"];

	const handleComplete = async () => {
		if (onComplete) {
			await completeLoading.executeAsync(
				async () => {
					// Criar log do todo
					await fetch('/api/todo-logs', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							todoId: todo.id,
							todoTitle: todo.title,
							difficulty: todo.difficulty,
							tags: todo.tags
						})
					});
					await onComplete(todo.id);
				},
				undefined,
				() => toast.error("Erro ao completar tarefa. Tente novamente.")
			);
		}
	};

	return (
		<Card className={`hover:shadow-md transition-shadow duration-200 ${completeLoading.isLoading ? "opacity-50 pointer-events-none" : ""}`}>
			<CardHeader className="px-4 pb-3">
				<div className="flex justify-between items-start gap-2">
					<div className="flex-1 min-w-0">
						<div className="flex justify-between items-start gap-2 mb-2">
							<div className="flex flex-1 items-center gap-2 min-w-0">
								<h3 className="font-semibold break-words line-clamp-1">
									{todo.title}
								</h3>
								{isCompleted && (
									<CheckCircle className="flex-shrink-0 w-5 h-5 text-green-600" />
								)}
							</div>

							{/* Botões movidos para o topo */}
							<div className="flex flex-shrink-0 items-center gap-1">
								{!isCompleted && (
									<Button
										title="Marcar como concluído"
										variant={"ghost"}
										onClick={handleComplete}
										size="icon"
										className="hover:bg-blue-50 rounded-full w-8 h-8 text-blue-600 hover:text-blue-600"
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
										className="hover:bg-gray-100 rounded-full w-8 h-8 text-gray-600"
									>
										<Edit className="w-4 h-4" />
									</Button>
								)}
							</div>
						</div>

						<div className="flex flex-wrap items-center gap-2 mb-2">
							<Badge className={`text-xs ${difficulty.color}`} title="Dificuldade">
								{difficulty.stars} {todo.difficulty}
							</Badge>

							<Badge
								className={`text-xs ${statusConfig[isCompleted ? 'completed' : 'pending']}`}
								title="Status"
							>
								<CheckCircle className="w-3 h-3" />
								{isCompleted ? "Concluído" : "Em andamento"}
							</Badge>

							{todo.startDate && (
								<Badge className="bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs" title="Data de início">
									<Calendar className="w-3 h-3" />
									{new Date(todo.startDate).toLocaleDateString()}
								</Badge>
							)}
						</div>

						{todo.observations && (
							<p className="mb-2 text-gray-600 text-sm break-words line-clamp-2">
								{todo.observations}
							</p>
						)}
					</div>
				</div>
			</CardHeader>

			<CardContent className="px-4 pt-0">
				{/* Área das tags com ícone */}
				{todo.tags && todo.tags.length > 0 && (
					<div className="flex items-start gap-2">
						<Tag className="flex-shrink-0 mt-0.5 w-4 h-4 text-slate-500" />
						<div className="flex flex-wrap gap-1 min-w-0">
							{todo.tags.slice(0, 2).map((tag) => (
								<Badge
									key={tag}
									variant="secondary"
									className="bg-slate-50 border border-slate-200 max-w-full text-slate-700 text-xs break-words"
								>
									{tag}
								</Badge>
							))}
							{todo.tags.length > 2 && (
								<Badge variant="outline" className="bg-slate-50 border border-slate-200 text-slate-700 text-xs">
									+{todo.tags.length - 2}
								</Badge>
							)}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
