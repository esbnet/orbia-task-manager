import { Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { DailySubtask } from "@/types";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useDailySubtaskContext } from "@/contexts/daily-subtask-context";

interface DailySubtaskListProps {
	dailyId: string;
	initialSubtasks?: DailySubtask[];
	onSubtasksChange?: (subtasks: DailySubtask[]) => void;
}

export function DailySubtaskList({
	dailyId,
	initialSubtasks = [],
	onSubtasksChange,
}: DailySubtaskListProps) {
	const hasDailyId = Boolean(dailyId);
	const [subtasks, setSubtasks] = useState<DailySubtask[]>(initialSubtasks);
	const [newTaskTitle, setNewTaskTitle] = useState("");
	const [editingDailySubtask, setEditingDailySubtask] = useState<DailySubtask | null>(null);

	useEffect(() => {
		setSubtasks(initialSubtasks);
	}, [initialSubtasks]);

	const updateSubtasks = (newSubtasks: DailySubtask[]) => {
		setSubtasks(newSubtasks);
		onSubtasksChange?.(newSubtasks);
	};

	const { createSubtask, updateSubtask, deleteSubtask } =
		useDailySubtaskContext();

	const addSubtask = async () => {
		if (!newTaskTitle.trim()) return;
		if (!hasDailyId) {
			toast.error("Salve a tarefa diária antes de adicionar subtarefas.");
			return;
		}

		try {
			const newSubtask = await createSubtask(
				newTaskTitle,
				dailyId,
				subtasks.length,
			);
			updateSubtasks([...subtasks, newSubtask]);
			setNewTaskTitle("");
		} catch (error) {
			const message = error instanceof Error ? error.message : "Erro ao criar tarefa";
			toast.error(message);
		}
	};

	const handleUpdateSubtask = async (updatedSubtask: DailySubtask) => {
		setEditingDailySubtask(null);
		try {
			await updateSubtask(updatedSubtask);
			updateSubtasks(
				subtasks.map((s) => (s.id === updatedSubtask.id ? updatedSubtask : s)),
			);
			toast.success(
				`Tarefa "${updatedSubtask.title}" atualizada com sucesso!`,
			);
		} catch (error) {
			toast.error("Erro ao atualizar tarefa");
		}
	}

	const toggleSubtask = async (subtask: DailySubtask) => {
		try {
			const updated = { ...subtask, completed: !subtask.completed };
			await updateSubtask(updated);
			updateSubtasks(
				subtasks.map((s) => (s.id === subtask.id ? updated : s)),
			);
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
			updateSubtasks(subtasks.filter((s) => s.id !== id));
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
					disabled={!hasDailyId}
					onChange={(e) => setNewTaskTitle(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							addSubtask();
						}
					}}
					placeholder={hasDailyId ? "Nova tarefa..." : "Salve a daily para adicionar subtarefas"}
					className="flex-1"
				/>
				<Button onClick={addSubtask} size="sm" type="button" disabled={!hasDailyId}>
					<Plus size={16} />
				</Button>
			</div>

			<div className="flex flex-col gap-0.5 w-full max-h-32 overflow-y-auto">
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
						{editingDailySubtask?.id === subtask.id && editingDailySubtask ? (
							<div className="flex flex-1 items-center gap-2 w-full">
								<Input
									value={editingDailySubtask.title || ""}
									onChange={(e) =>
										setEditingDailySubtask({
											...editingDailySubtask,
											title: e.target.value,
										})
									}
									className="flex-1"
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											addSubtask();
										}
									}}

								/>
								<Button onClick={() => handleUpdateSubtask(editingDailySubtask)} size="sm">
									Salvar
								</Button>
								<Button
									variant="outline"
									onClick={() => setEditingDailySubtask(null)}
									size="sm"
								>
									Cancelar
								</Button>
							</div>
						) : (
							<div className="flex flex-1 items-center gap-2 w-full">
								<div className="flex flex-1 items-center gap-3">
									<span
										className={`flex-1 text-sm ${subtask.completed ? "line-through text-muted-foreground" : ""}`}
									>
										{subtask.title}
									</span>
								</div>
								<div className="flex justify-end gap-2">
									<Button
										onClick={() => setEditingDailySubtask(subtask)}
										size="sm"
										variant="ghost"
									>
										<Edit size={14} />
									</Button>
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
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
