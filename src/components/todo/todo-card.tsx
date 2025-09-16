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
	"Trivial": { color: "bg-gray-100 text-gray-800", stars: "⭐" },
	"Fácil": { color: "bg-green-100 text-green-800", stars: "⭐⭐" },
	"Médio": { color: "bg-yellow-100 text-yellow-800", stars: "⭐⭐⭐" },
	"Difícil": { color: "bg-red-100 text-red-800", stars: "⭐⭐⭐⭐" },
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
							<Badge className={`text-xs ${difficulty.color}`}>
								{difficulty.stars} {todo.difficulty}
							</Badge>
							{todo.startDate && (
								<div className="flex items-center gap-1 text-blue-600 text-sm">
									<Calendar className="w-4 h-4" />
									<span>{new Date(todo.startDate).toLocaleDateString()}</span>
								</div>
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
									className="text-xs"
								>
									<Tag className="mr-1 w-3 h-3" />
									{tag}
								</Badge>
							))}
							{todo.tags.length > 2 && (
								<Badge variant="outline" className="text-xs">
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
