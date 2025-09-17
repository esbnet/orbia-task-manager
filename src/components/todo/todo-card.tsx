import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
	Calendar,
	CheckCircle,
	Edit,
	Tag
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTodoContext } from "@/contexts/todo-context";
import { useButtonLoading } from "@/hooks/use-button-loading";
import { toast } from "sonner";
import type { Todo } from "../../types";

interface TodoCardProps {
	todo: Todo;
	onEdit?: (todo: Todo) => void;
	onComplete?: (id: string) => Promise<void>;
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
	isCompleted = false
}: TodoCardProps) {
	const { completeTodo } = useTodoContext();
	const completeLoading = useButtonLoading();
	const difficulty = difficultyConfig[todo.difficulty as keyof typeof difficultyConfig] || difficultyConfig["Fácil"];

	const handleComplete = async () => {
		await completeLoading.executeAsync(
			async () => {
				if (onComplete) {
					await onComplete(todo.id);
				} else {
					await completeTodo(todo);
					toast.success(`Afazer "${todo.title}" concluído!`);
				}
			},
			undefined,
			() => toast.error("Erro ao completar afazer. Tente novamente.")
		);
	};

	return (
		<Card className={`hover:shadow-md transition-shadow duration-200 ${completeLoading.isLoading ? "opacity-50 pointer-events-none" : ""}`}>
			<CardHeader className="pb-3">
				<div className="flex justify-between items-start">
					<div className="flex-1">
						<div className="flex justify-between items-center mb-2">
							<div className="flex items-center gap-2">
								<h3 className="font-semibold line-clamp-1">
									{todo.title}
								</h3>
								{isCompleted && (
									<CheckCircle className="w-5 h-5 text-green-600" />
								)}
							</div>

							{/* Botões movidos para o topo */}
							<div className="flex items-center">
								{!isCompleted && (
									<Button
										title="Marcar como concluído"
										variant={"ghost"}
										onClick={handleComplete}
										size="icon"
										className="hover:bg-blue-50 rounded-full text-blue-600 hover:text-blue-600"
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
										className="hover:bg-gray-100 rounded-full text-gray-600"
									>
										<Edit className="w-4 h-4" />
									</Button>
								)}
							</div>
						</div>

						<div className="flex items-center gap-2 mb-2">
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
							<p className="mb-2 text-gray-600 text-sm line-clamp-2">
								{todo.observations}
							</p>
						)}
					</div>
				</div>
			</CardHeader>

			<CardContent className="pt-0">
				{/* Área das tags com ícone */}
				{todo.tags && todo.tags.length > 0 && (
					<div className="flex items-center gap-2">
						<div className="flex gap-1">
							{todo.tags.slice(0, 2).map((tag) => (
								<Badge
									key={tag}
									variant="secondary"
									className="bg-slate-50 border border-slate-200 text-slate-700 text-xs"
								>
									<Tag className="mr-1 w-3 h-3" />
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
