import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCreateTodo, useDeleteTodo, useTodos } from "@/hooks/use-todos";
import type { Todo as DomainTodo } from "@/domain/entities/todo";
import type { Todo, TodoDifficulty } from "@/types/todo";
import { Info, ListChecks, Plus, SquareCheckBig } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useState } from "react";
import { toast } from "sonner";
import { TodoCard } from "./todo-card";
import { TodoForm } from "./todo-form";

const defaultTodo: Todo = {
	id: "",
	userId: "",
	title: "",
	observations: "",
	tasks: [],
	tags: [],
	difficulty: "Fácil" as TodoDifficulty,
	startDate: new Date(),
	createdAt: new Date(),
	recurrence: "none" as const,
	todoType: { isPontual: () => true, isRecorrente: () => false } as any,
};

export const TodoColumn = () => {
	const { data: todos = [], isLoading } = useTodos();
	const createTodoMutation = useCreateTodo();
	const deleteTodoMutation = useDeleteTodo();

	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingTodo, setEditingTodo] = useState<any>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [todoToDelete, setTodoToDelete] = useState<any>(null);


	const today = new Date().toISOString().split("T")[0];

	// Função auxiliar para determinar se uma tarefa deve aparecer na lista
	const shouldShowTodo = (todo: any): boolean => {
		// Tarefas pontuais sempre aparecem (não desaparecem após conclusão)
		if (todo.recurrence === "none") {
			return true;
		}

		// Para tarefas recorrentes, verificar se devem reaparecer
		const lastCompleted = todo.lastCompletedDate ? new Date(todo.lastCompletedDate) : null;
		if (!lastCompleted) return true;

		const todayDate = new Date(today);
		let shouldRecur = false;

		switch (todo.recurrence) {
			case "daily":
				const daysSinceDaily = Math.floor((todayDate.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24));
				shouldRecur = daysSinceDaily >= 1;
				break;
			case "weekly":
				const daysSinceWeekly = Math.floor((todayDate.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24));
				shouldRecur = daysSinceWeekly >= 7;
				break;
			case "monthly":
				const daysSinceMonthly = Math.floor((todayDate.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24));
				shouldRecur = daysSinceMonthly >= 30;
				break;
			case "custom":
				if (todo.recurrenceInterval) {
					const daysSinceCustom = Math.floor((todayDate.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24));
					shouldRecur = daysSinceCustom >= todo.recurrenceInterval;
				}
				break;
		}

		return shouldRecur;
	};

	const inProgressTodos = todos.filter(shouldShowTodo).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

	// Funções de controle do formulário
	const openEditForm = (todo: any) => {
		setEditingTodo(todo);
		setIsFormOpen(true);
	};

	const closeForm = () => {
		setIsFormOpen(false);
		setEditingTodo(null);
	};

	// Criar novo todo
	const handleCreateTodo = async (todoData: Omit<any, "id" | "createdAt">) => {
		try {
			await createTodoMutation.mutateAsync(todoData);
			toast.success(`Todo "${todoData.title}" criado com sucesso!`);
			setIsFormOpen(false);
		} catch (error) {
			toast.error("Erro ao criar todo. Tente novamente.");
		}
	};

	// Editar todo existente
	const handleEditTodo = async (todoData: Omit<any, "id" | "createdAt">) => {
		// TODO: Implementar edição quando useUpdateTodo estiver funcionando
		toast.success(`Todo "${todoData.title}" - edição será implementada em breve!`);
		setIsFormOpen(false);
		setEditingTodo(null);
	};

	// Deletar todo
	const handleDeleteTodo = (id: string) => {
		const todo = inProgressTodos.find(t => t.id === id);
		if (todo) {
			setTodoToDelete(todo);
			setIsDeleteDialogOpen(true);
		}
	};



	const confirmDeleteTodo = async () => {
		if (todoToDelete) {
			try {
				await deleteTodoMutation.mutateAsync(todoToDelete.id);
				toast.success(`Todo "${todoToDelete.title}" removido com sucesso!`);
				setIsDeleteDialogOpen(false);
				setTodoToDelete(null);
			} catch (error) {
				toast.error("Erro ao remover todo. Tente novamente.");
			}
		}
	};

	return (
		<div className="flex flex-col gap-4 bg-gradient-to-br from-blue-50/30 dark:from-blue-950/20 to-sky-50/30 dark:to-sky-950/20 p-4 border border-blue-100/50 dark:border-blue-800/30 rounded-xl">
			<Card className="bg-gradient-to-r from-blue-50 dark:from-blue-900/50 to-sky-50 dark:to-sky-900/50 border-blue-200 dark:border-blue-700">
				<CardHeader className="pb-3">
					<div className="flex justify-between items-center">
						<div className="flex items-center gap-2">
							<ListChecks className="w-6 h-6 text-blue-600" />
							<CardTitle className="font-bold text-blue-900 text-xl">
								Tarefa
							</CardTitle>
						</div>
						<div className="flex items-center gap-2">
							<Button
								onClick={() => setIsFormOpen(true)}
								size="sm"
								className="bg-blue-600 hover:bg-blue-700 text-white"
							>
								<Plus className="mr-1 w-4 h-4" />
								Novo Tarefa
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent className="pt-0">
					<div className="flex justify-between items-center gap-4 text-blue-700 text-sm">
						<div className="flex items-center gap-1">
							<span>{inProgressTodos.length} ativos</span>
						</div>
						<Tooltip>
							<TooltipTrigger asChild>
								<Info className="w-4 h-4 text-blue-500 hover:text-blue-700 transition-colors cursor-help" />
							</TooltipTrigger>
							<TooltipContent side="bottom" align="end" className="max-w-xs">
								<h1><SquareCheckBig className="inline-block mr-1 w-3 h-3" />Foco: produtividade</h1>
								<p>Tarefas pontuais que precisam ser realizadas uma vez ou em datas específicas. Ideal para atividades únicas ou projetos com prazo definido.</p>
							</TooltipContent>
						</Tooltip>

					</div>
				</CardContent>
			</Card>

			{/* Loading State */}
			{isLoading && (
				<Card className="bg-blue-50 border-blue-200">
					<CardContent className="py-8 text-center">
						<div className="mx-auto mb-3 border-4 border-t-transparent border-blue-600 rounded-full w-8 h-8 animate-spin"></div>
						<p className="text-blue-600">Carregando tarefa...</p>
					</CardContent>
				</Card>
			)}

			<div className="space-y-4">
				{inProgressTodos.length > 0 ? (
					inProgressTodos.map((todo) => (
						<TodoCard
							key={todo.id}
							todo={{
								...todo,
								todoType: {
									isPontual: () => todo.todoType === "pontual",
									isRecorrente: () => todo.todoType === "recorrente"
								} as any
							} as any}
							onEdit={openEditForm}
							onDelete={handleDeleteTodo}
						/>
					))
				) : (
					!isLoading && (
						<Card className="bg-gray-50 border-gray-300 border-dashed">
							<CardContent className="py-8 text-center">
								<ListChecks className="mx-auto mb-3 w-12 h-12 text-gray-400" />
								<h3 className="mb-2 font-medium text-gray-600 text-lg">
									Nenhum tarefa cadastrado
								</h3>
								<p className="mb-4 text-gray-500">
									Comece criando seu primeiro tarefa para
									organizar suas tarefas
								</p>
								<Button
									onClick={() => setIsFormOpen(true)}
									className="bg-blue-600 hover:bg-blue-700"
								>
									<Plus className="mr-2 w-4 h-4" />
									Criar Primeiro Tarefa
								</Button>
							</CardContent>
						</Card>
					)
				)}
			</div>

			{/* Todo Form Modal */}
			<TodoForm
				todo={editingTodo || defaultTodo}
				onSubmit={editingTodo ? handleEditTodo : handleCreateTodo}
				onCancel={closeForm}
				open={isFormOpen}
			/>

			{/* Delete Confirmation Dialog */}
			<ConfirmationDialog
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
				onConfirm={confirmDeleteTodo}
				title="Remover Todo"
				description={`Tem certeza que deseja remover o todo "${todoToDelete?.title}"? Esta ação não pode ser desfeita.`}
				confirmText="Remover"
				cancelText="Cancelar"
			/>
		</div>
	);
};
