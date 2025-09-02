import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useTodoSubtaskContext } from "@/contexts/todo-subtask-context";
import type { TodoSubtask } from "@/types";
import { toast } from "sonner";

interface TodoSubtaskListProps {
	todoId: string;
	initialSubtasks?: TodoSubtask[];
	onSubtasksChange?: (subtasks: TodoSubtask[]) => void;
}

export function TodoSubtaskList({
	todoId,
	initialSubtasks = [],
	onSubtasksChange,
}: TodoSubtaskListProps) {
	const [subtasks, setSubtasks] = useState<TodoSubtask[]>(initialSubtasks);
	const [newTaskTitle, setNewTaskTitle] = useState("");
	const [isLoadingSubtasks, setIsLoadingSubtasks] = useState(false);

	// Fetch subtasks from API when component loads or todoId changes
	useEffect(() => {
		const fetchSubtasks = async () => {
			if (!todoId) return;
			
			setIsLoadingSubtasks(true);
			try {
				const response = await fetch(`/api/todo-subtasks?todoId=${todoId}`);
				if (response.ok) {
					const data = await response.json();
					setSubtasks(data.subtasks || []);
					onSubtasksChange?.(data.subtasks || []);
				} else {
					// Fallback to initialSubtasks if API fails
					setSubtasks(initialSubtasks);
				}
			} catch (error) {
				// Fallback to initialSubtasks if API fails
				setSubtasks(initialSubtasks);
			} finally {
				setIsLoadingSubtasks(false);
			}
		};

		fetchSubtasks();
	}, [todoId]); // Only depend on todoId, not initialSubtasks

	// Also update from initialSubtasks when they change (as fallback)
	useEffect(() => {
		if (!isLoadingSubtasks) {
			// Only use initialSubtasks if we haven't successfully loaded from API
			if (subtasks.length === 0 && initialSubtasks.length > 0) {
				setSubtasks(initialSubtasks);
			}
		}
	}, [initialSubtasks, isLoadingSubtasks, subtasks.length]);



	const { createSubtask, updateSubtask, deleteSubtask } =
		useTodoSubtaskContext();

	const addSubtask = async () => {
		if (!newTaskTitle.trim()) return;

		try {
			const newSubtask = await createSubtask(
				newTaskTitle,
				todoId,
				subtasks.length,
			);
			const updatedSubtasks = [...subtasks, newSubtask];
			setSubtasks(updatedSubtasks);
			onSubtasksChange?.(updatedSubtasks);
			setNewTaskTitle("");
		} catch (error) {
			toast.error("Erro ao criar tarefa");
		}
	};

	const toggleSubtask = async (subtask: TodoSubtask) => {
		try {
			const updated = { ...subtask, completed: !subtask.completed };
			await updateSubtask(updated);
			const updatedSubtasks = subtasks.map((s) => (s.id === subtask.id ? updated : s));
			setSubtasks(updatedSubtasks);
			onSubtasksChange?.(updatedSubtasks);
			toast.success(
				`Tarefa "${subtask.title}" ${updated.completed ? "concluída" : "reaberta"}!`,
			);
		} catch (error) {
			toast.error("Erro ao atualizar tarefa");
		}
	};

	const handleDeleteSubtask = async (id: string, title: string) => {
		try {
			await deleteSubtask(id);
			const updatedSubtasks = subtasks.filter((s) => s.id !== id);
			setSubtasks(updatedSubtasks);
			onSubtasksChange?.(updatedSubtasks);
			toast.success(`Tarefa "${title}" removida com sucesso!`);
		} catch (error) {
			toast.error("Erro ao deletar tarefa");
		}
	};

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center gap-2">
				<Input
					value={newTaskTitle}
					onChange={(e) => setNewTaskTitle(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							addSubtask();
						}
					}}
					placeholder="Nova tarefa..."
					className="flex-1"
				/>
				<Button onClick={addSubtask} size="sm" type="button">
					<Plus size={16} />
				</Button>
			</div>

			<div className="flex flex-col gap-0.5 max-h-32 overflow-y-auto">
				{subtasks.map((subtask) => (
					<div
						key={subtask.id}
						className="flex items-center gap-2 bg-background/20 px-1 rounded"
						onClick={(e) => e.stopPropagation()}
					>
						<Checkbox
							checked={subtask.completed}
							onCheckedChange={() => toggleSubtask(subtask)}
						/>
						<span
							className={`flex-1 text-sm ${subtask.completed ? "line-through text-muted-foreground" : ""}`}
						>
							{subtask.title}
						</span>
						<Button
							onClick={(e) => {
								e.stopPropagation();
								handleDeleteSubtask(subtask.id, subtask.title);
							}}
							size="sm"
							variant="ghost"
							type="button"
							className="p-0 w-6 h-6 text-destructive"
						>
							<Trash2 size={12} />
						</Button>
					</div>
				))}
			</div>
		</div>
	);
}
