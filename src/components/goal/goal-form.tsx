"use client";

import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, SaveIcon, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useGoals } from "@/contexts/goal-context";
import type { Goal } from "@/domain/entities/goal";
import { useActiveTasks } from "@/hooks/use-active-tasks";
import { useTags } from "@/hooks/use-tags";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { MultiSelect } from "../ui/multi-select";
import { SpinCircle } from "../ui/spin-circle";

interface AttachedTask {
	id: string;
	taskId: string;
	taskType: "habit" | "daily" | "todo";
	taskTitle: string;
	taskDifficulty: string;
}

// Hook inline para buscar tarefas anexadas
function useAttachedTasks(goalId?: string) {
	return useQuery({
		queryKey: ["attached-tasks", goalId],
		queryFn: async (): Promise<AttachedTask[]> => {
			if (!goalId) return [];

			const response = await fetch(`/api/goals/${goalId}/tasks`);

			if (!response.ok) {
				throw new Error("Erro ao buscar tarefas anexadas: " + response.status);
			}

			const data = await response.json();

			return data;
		},
		enabled: !!goalId,
		staleTime: 2 * 60 * 1000,
		retry: 1,
	});
}

interface GoalFormData {
	title: string;
	description: string;
	targetDate: Date;
	priority: Goal["priority"];
	tags: string[];
	attachedTasks: Array<{ taskId: string; taskType: "habit" | "daily" | "todo" }>;
}

interface GoalFormProps {
	goal?: Goal | null;
	onSubmit: (data: GoalFormData) => void;
	onCancel: () => void;
	open?: boolean;
	isLoading?: boolean;
}

const priorities: Goal["priority"][] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export function GoalForm({ goal, onSubmit, onCancel, open = true, isLoading = false }: GoalFormProps) {
	const { tagOptions } = useTags();
	const { data: activeTasks, isLoading: isLoadingTasks } = useActiveTasks();
	const { data: attachedTasksData, isLoading: isLoadingAttachedTasks } = useAttachedTasks(goal?.id);
	const [formData, setFormData] = useState<GoalFormData>({
		title: "",
		description: "",
		targetDate: new Date(),
		priority: "MEDIUM",
		tags: [],
		attachedTasks: [],
	});

	useEffect(() => {
		// Se a goal tem ID, é uma edição, senão é criação
		if (goal && goal.id) {
			// Modo edição: preencher com dados da goal
			setFormData({
				title: goal.title,
				description: goal.description,
				targetDate: goal.targetDate,
				priority: goal.priority,
				tags: goal.tags,
				attachedTasks: [],
			});
		} else {
			// Modo criação: limpar todos os campos
			setFormData({
				title: "",
				description: "",
				targetDate: new Date(),
				priority: "MEDIUM",
				tags: [],
				attachedTasks: [],
			});
		}
	}, [goal?.id, goal?.title, goal?.description, goal?.targetDate, goal?.priority, goal?.tags, goal]);

	// Efeito separado para atualizar attachedTasks quando os dados são carregados
	useEffect(() => {
		if (attachedTasksData) {
			setFormData((prev) => ({
				...prev,
				attachedTasks: attachedTasksData.map((task) => ({
					taskId: task.taskId,
					taskType: task.taskType,
				})),
			}));
		}
	}, [attachedTasksData]);

	const handleSubmit = useCallback((e: React.FormEvent) => {
		e.preventDefault();

		if (formData.title.trim() && formData.targetDate) {
			onSubmit(formData);

			// ✅ Limpar formulário após criação bem-sucedida (se não for edição)
			if (!goal?.id) {
				setFormData({
					title: "",
					description: "",
					targetDate: new Date(),
					priority: "MEDIUM",
					tags: [],
					attachedTasks: [],
				});
			}
		}
	}, [formData, onSubmit, goal?.id]);

	const handleCancel = useCallback(() => {
		onCancel();
	}, [onCancel]);

	return (
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
			<DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="font-bold text-xl">
						{goal ? "Editar Meta" : "Nova Meta"}
					</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="title">Título *</Label>
						<Input
							id="title"
							value={formData.title}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									title: e.target.value,
								}))
							}
							placeholder="Digite o título da sua meta"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Descrição</Label>
						<Textarea
							id="description"
							value={formData.description}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									description: e.target.value,
								}))
							}
							placeholder="Descreva sua meta em detalhes"
							rows={3}
						/>
					</div>

					<div className="space-y-2">
						<Label>Prioridade</Label>
						<Select
							value={formData.priority}
							onValueChange={(value: Goal["priority"]) =>
								setFormData((prev) => ({
									...prev,
									priority: value,
								}))
							}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{priorities.map((priority) => (
									<SelectItem
										key={priority}
										value={priority}
									>
										{priority === "LOW" && "Baixa"}
										{priority === "MEDIUM" && "Média"}
										{priority === "HIGH" && "Alta"}
										{priority === "URGENT" && "Urgente"}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label>Data Meta *</Label>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									className="justify-start w-full font-normal text-left"
								>
									<CalendarIcon className="mr-2 w-4 h-4" />
									{formData.targetDate ? (
										format(
											formData.targetDate,
											"dd 'de' MMMM 'de' yyyy",
											{ locale: ptBR },
										)
									) : (
										<span>Selecione uma data</span>
									)}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="p-0 w-auto">
								<Calendar
									mode="single"
									selected={formData.targetDate}
									onSelect={(date) =>
										date &&
										setFormData((prev) => ({
											...prev,
											targetDate: date,
										}))
									}
									initialFocus
									locale={ptBR}
								/>
							</PopoverContent>
						</Popover>
					</div>

					<div className="space-y-2">
						<Label>Etiquetas</Label>
						<MultiSelect
							key={`tags-${tagOptions.length}`}
							id="tags"
							options={tagOptions}
							onValueChange={(value: string[]) => setFormData((prev) => ({ ...prev, tags: value }))}
							defaultValue={formData.tags || []}
							placeholder="Adicionar etiquetas"
							variant="inverted"
							maxCount={3}
						/>
					</div>

					<div className="space-y-2">
						<Label>Tarefas Relacionadas</Label>
						<MultiSelect
							key={`attached-tasks-${formData.attachedTasks.length}`}
							id="attachedTasks"
							options={activeTasks?.map(task => ({
								label: `${task.icon} ${task.title}`,
								value: `${task.type}:${task.id}`,
								color: task.type === "habit" ? "#10b981" : task.type === "daily" ? "#3b82f6" : "#f59e0b"
							})) || []}
							onValueChange={(value: string[]) => {
								const attachedTasks = value.map(v => {
									const [taskType, taskId] = v.split(":");
									return { taskId, taskType: taskType as "habit" | "daily" | "todo" };
								});
								setFormData((prev) => ({ ...prev, attachedTasks }));
							}}
							defaultValue={activeTasks && formData.attachedTasks ? formData.attachedTasks.map(task => `${task.taskType}:${task.taskId}`) : []}
							value={activeTasks && formData.attachedTasks ? formData.attachedTasks.map(task => `${task.taskType}:${task.taskId}`) : []}
							placeholder={isLoadingAttachedTasks ? "Carregando tarefas..." : "Selecionar tarefas relacionadas"}
							variant="inverted"
							maxCount={5}
							disabled={isLoadingAttachedTasks}
						/>
					</div>

					<div className="flex justify-end gap-2 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={handleCancel}
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							className="flex-1"
							disabled={isLoading}
						>
							{isLoading ? (
								<>
									<SpinCircle className="mr-2" />
									Salvando...
								</>
							) : (
								<>
									<SaveIcon className="mr-2" />
									Salvar
								</>
							)}
						</Button>
					</div>
				</form>

				{/* Botão de delete - só aparece no modo edição */}
				{goal && goal.id && (
					<div className="flex justify-center items-center mt-4 w-full">
						<DialogConfirmDelete id={goal.id} onCancel={handleCancel} />
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}

function DialogConfirmDelete({ id, onCancel }: { id: string; onCancel: () => void }) {
	const [isDeleting, setIsDeleting] = useState(false);
	const { deleteGoal } = useGoals();

	const onDelete = async () => {
		if (isDeleting) return;
		setIsDeleting(true);
		try {
			await deleteGoal(id);
			toast.success("Meta excluída com sucesso!");
			onCancel(); // Fecha o formulário após deletar
		} catch (error) {
			toast.error("Erro ao excluir meta" + error);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					variant="link"
					className="flex justify-center items-center hover:bg-background/20 rounded-lg text-destructive cursor-pointer"
				>
					<Trash2 size={16} className="mr-1" />
					Deletar esta meta
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Você tem certeza?</DialogTitle>
					<DialogDescription>
						Confirmando a exclusão, você não poderá desfazer essa ação.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						type="submit"
						variant="destructive"
						onClick={onDelete}
						disabled={isDeleting}
					>
						{isDeleting ? "Excluindo..." : "Excluir"}
					</Button>
					<DialogClose asChild>
						<Button variant="outline">Cancelar</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
