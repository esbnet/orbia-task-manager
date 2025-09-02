import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Todo, TodoDifficulty } from "@/types/todo";
import { ListChecks, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useTodoContext } from "@/contexts/todo-context";
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
};

export const TodoColumn = () => {
	const { todos, addTodo, deleteTodo } = useTodoContext();
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [todoToDelete, setTodoToDelete] = useState<Todo | null>(null);

	const inProgressTodos = todos;

	// Funções de controle do formulário
	const openEditForm = (todo: Todo) => {
		setEditingTodo(todo);
		setIsFormOpen(true);
	};

	const closeForm = () => {
		setIsFormOpen(false);
		setEditingTodo(null);
	};

	// Criar novo todo
	const handleCreateTodo = async (todoData: Omit<Todo, "id" | "createdAt">) => {
		try {
			await addTodo(todoData);
			toast.success(`Todo "${todoData.title}" criado com sucesso!`);
			setIsFormOpen(false);
		} catch (error) {
			toast.error("Erro ao criar todo. Tente novamente.");
		}
	};

	// Editar todo existente
	const handleEditTodo = async (todoData: Omit<Todo, "id" | "createdAt">) => {
		try {
			// TODO: Implementar updateTodo no contexto
			toast.success(`Todo "${todoData.title}" atualizado com sucesso!`);
			setIsFormOpen(false);
			setEditingTodo(null);
		} catch (error) {
			toast.error("Erro ao atualizar todo. Tente novamente.");
		}
	};

	// Deletar todo
	const handleDeleteTodo = (id: string) => {
		const todo = todos.find(t => t.id === id);
		if (todo) {
			setTodoToDelete(todo);
			setIsDeleteDialogOpen(true);
		}
	};

	const confirmDeleteTodo = async () => {
		if (todoToDelete) {
			try {
				await deleteTodo(todoToDelete.id);
				toast.success(`Todo "${todoToDelete.title}" removido com sucesso!`);
				setIsDeleteDialogOpen(false);
				setTodoToDelete(null);
			} catch (error) {
				toast.error("Erro ao remover todo. Tente novamente.");
			}
		}
	};

	return (
		<div className="flex flex-col gap-4">
			<Card className="bg-gradient-to-r from-blue-50 to-sky-50 border-blue-200">
				<CardHeader className="pb-3">
					<div className="flex justify-between items-center">
						<div className="flex items-center gap-2">
							<ListChecks className="w-6 h-6 text-blue-600" />
							<CardTitle className="font-bold text-blue-900 text-xl">
								Afazeres
							</CardTitle>
						</div>
						<Button
							onClick={() => setIsFormOpen(true)}
							size="sm"
							className="bg-blue-600 hover:bg-blue-700 text-white"
						>
							<Plus className="mr-1 w-4 h-4" />
							Novo Afazer
						</Button>
					</div>
				</CardHeader>
				<CardContent className="pt-0">
					<div className="flex items-center gap-4 text-blue-700 text-sm">
						<div className="flex items-center gap-1">
							<span>{inProgressTodos.length} ativos</span>
						</div>
					</div>
				</CardContent>
			</Card>

			<div className="space-y-4">
				<h3 className="flex items-center gap-1 mb-2 font-semibold text-blue-600 text-sm">
					<ListChecks className="w-4 h-4 text-blue-600" />
					Disponíveis
				</h3>

				{inProgressTodos.length > 0 ? (
					inProgressTodos.map((todo) => (
						<TodoCard
							key={todo.id}
							todo={todo}
							onEdit={openEditForm}
						/>
					))
				) : (
					<Card className="bg-gray-50 border-gray-300 border-dashed">
						<CardContent className="py-8 text-center">
							<ListChecks className="mx-auto mb-3 w-12 h-12 text-gray-400" />
							<h3 className="mb-2 font-medium text-gray-600 text-lg">
								Nenhum afazer cadastrado
							</h3>
							<p className="mb-4 text-gray-500">
								Comece criando seu primeiro afazer para
								organizar suas tarefas
							</p>
							<Button
								onClick={() => setIsFormOpen(true)}
								className="bg-blue-600 hover:bg-blue-700"
							>
								<Plus className="mr-2 w-4 h-4" />
								Criar Primeiro Afazer
							</Button>
						</CardContent>
					</Card>
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
