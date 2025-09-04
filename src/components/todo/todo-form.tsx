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
import { format, setDefaultOptions } from "date-fns";
import { CalendarIcon, SaveIcon, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTodoContext } from "@/contexts/todo-context";
import { useTags } from "@/hooks/use-tags";
import type { TodoDifficulty } from "@/types/todo";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import type { Todo } from "../../types";
import { MultiSelect } from "../ui/multi-select";
import { TodoCard } from "./todo-card";
import { TodoSubtaskList } from "./todo-subtask-list";

setDefaultOptions({ locale: ptBR });

interface TodoFormProps {
	todo: Todo;
	onSubmit?: (todo: Omit<Todo, "id" | "createdAt">) => Promise<void>;
	onCancel?: () => void;
	open?: boolean;
}

export function TodoForm({
	todo,
	onSubmit,
	onCancel,
	open = false,
}: TodoFormProps) {
	const { updateTodo } = useTodoContext();
	const { tagOptions } = useTags();

	const [title, setTitle] = useState(todo.title || "");
	const [observations, setObservations] = useState(todo.observations || "");
	const [difficulty, setDifficult] = useState<TodoDifficulty>(
		todo.difficulty || "Fácil",
	);
	const [startDate, setStartDate] = useState(todo.startDate || new Date());
	const [tags, setTags] = useState<string[]>(todo.tags || []);

	const [internalOpen, setInternalOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	// Usar prop externa se fornecida, senão usar estado interno
	const isOpen = open !== undefined ? open : internalOpen;

	// Resetar campos quando o todo prop mudar
	useEffect(() => {
		// Se o todo tem ID, é uma edição, senão é criação
		if (todo.id) {
			// Modo edição: preencher com dados do todo
			setTitle(todo.title || "");
			setObservations(todo.observations || "");
			setDifficult(todo.difficulty || "Fácil");
			setStartDate(todo.startDate || new Date());
			setTags(todo.tags || []);
		} else {
			// Modo criação: limpar todos os campos
			setTitle("");
			setObservations("");
			setDifficult("Fácil");
			setStartDate(new Date());
			setTags([]);
		}
	}, [todo.id, todo.title, todo.observations, todo.difficulty, todo.startDate, todo.tags]);

	async function handleUpdateTodo(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		if (!title.trim()) return;
		if (isLoading) return;

		setIsLoading(true);
		try {
			if (onSubmit && !todo.id) {
				await onSubmit({
					title,
					observations,
					tasks: todo.tasks || [],
					difficulty,
					startDate,
					tags,
				} as Omit<Todo, "id" | "createdAt">);
				setInternalOpen(false);
				if (onCancel) onCancel();
				return;
			}

			await updateTodo({
				...todo,
				title,
				observations: observations || "",
				difficulty: difficulty,
				startDate: startDate || new Date(),
				tags: tags || [],
			} as Todo);

			toast.success("Tarefa atualizada com sucesso!");
			setInternalOpen(false);
			if (onCancel) onCancel();
		} catch (error) {
			toast.error(`Erro ao atualizar tarefa${error}`);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<>
			{/* Só renderizar TodoCard se não estiver usando prop externa open */}
			{open === undefined && (
				<TodoCard
					todo={todo}
				/>
			)}
			<Dialog
				open={isOpen}
				onOpenChange={(v) => {
					if (open === undefined) {
						setInternalOpen(v);
					}
					if (!v && onCancel) onCancel();
				}}
			>
				<DialogContent className="flex flex-col gap-4 shadow-xl backdrop-blur-sm backdrop-opacity-0">
					<DialogHeader className="flex flex-col gap-1">
						<DialogTitle>Editar Afazer</DialogTitle>

						<DialogDescription className="text-zinc-400 text-sm">
							Altere os detalhes da tarefa
						</DialogDescription>
					</DialogHeader>

					<form
						onSubmit={handleUpdateTodo}
						className="flex flex-col gap-4 bg-gray-100/20 p-2 rounded-lg animate-[fadeIn_1s_ease-in-out_forwards]"
					>
						<div className="flex flex-col gap-1">
							<Label className="font-bold">Título</Label>
							<Input
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="Nova diária"
								required
							/>
						</div>
						<div className="flex flex-col gap-1">
							<Label className="font-bold">Observação</Label>
							<Input
								value={observations}
								onChange={(e) =>
									setObservations(e.target.value)
								}
								placeholder="Adicionar observações"
							/>
						</div>
						<div className="flex flex-col gap-1">
							<Label className="font-bold">
								Lista de tarefas
							</Label>
							<TodoSubtaskList
								todoId={todo.id}
								initialSubtasks={todo.subtasks || []}
							/>
						</div>
						<div className="flex flex-col gap-1">
							<Label className="font-bold" htmlFor="tags">
								Etiquetas
							</Label>
							<MultiSelect
								id="tags"
								options={tagOptions}
								onValueChange={(value) => setTags(value)}
								defaultValue={tags || []}
								placeholder="Adicionar etiquetas"
								variant="inverted"
								maxCount={3}
							/>
						</div>

						<div className="flex flex-col gap-1">
							<Label className="font-bold">Dificuldade</Label>
							<Select
								onValueChange={(value) =>
									setDifficult(value as TodoDifficulty)
								}
								value={difficulty || "Fácil"}
							>
								<SelectTrigger className="w-full">
									<SelectValue
										placeholder="Dificuldade"
										className="text-zinc-300"
									/>
								</SelectTrigger>
								<SelectContent
									className="w-full"
									defaultValue={difficulty || "Fácil"}
								>
									<SelectItem value="Trivial">
										Trivial ⭐
									</SelectItem>
									<SelectItem value="Fácil">
										Fácil ⭐⭐
									</SelectItem>
									<SelectItem value="Média">
										Média ⭐⭐⭐{" "}
									</SelectItem>
									<SelectItem value="Difícil">
										Difícil ⭐⭐⭐⭐
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="flex flex-col gap-1">
							<Label className="font-bold">Data de início</Label>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										data-empty={!startDate}
										className="justify-start w-full font-normal data-[empty=true]:text-muted-foreground text-left"
									>
										<CalendarIcon />
										{startDate ? (
											format(startDate, "PPP", {
												locale: ptBR,
											})
										) : (
											<span>Pick a date</span>
										)}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="p-0 w-auto">
									<Calendar
										mode="single"
										required={true}
										selected={startDate}
										onSelect={setStartDate}
									/>
								</PopoverContent>
							</Popover>
						</div>

						<div className="flex justify-end gap-1 mt-2">
							<DialogClose asChild>
								<Button variant="link">Cancel</Button>
							</DialogClose>
							<Button
								type="submit"
								className=""
								disabled={isLoading}
							>
								<SaveIcon />
								{isLoading ? "Salvando..." : "Salvar"}
							</Button>
						</div>
					</form>
					<div className="flex justify-right items-center">
						<DialogConfirmDelete id={todo.id} />
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}

function DialogConfirmDelete({ id }: { id: string }) {
	const { deleteTodo } = useTodoContext();
	const [isDeleting, setIsDeleting] = useState(false);

	const onDelete = async () => {
		if (isDeleting) return;
		setIsDeleting(true);
		try {
			await deleteTodo(id);
			toast.success("Tarefa excluída com sucesso!");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<div className="flex justify-center items-center mt-4 w-full">
					<Button
						variant="link"
						// size="sm"
						className="flex justify-center items-center hover:bg-background/20 rounded-lg text-destructive cursor-pointer"
					>
						<Trash2 size={16} /> Delete esta tarefa
					</Button>
				</div>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Você tem certeza?</DialogTitle>
					<DialogDescription>
						Confirmando a exclusão, você não poderá desfazer essa
						ação.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						type="submit"
						variant={"destructive"}
						onClick={onDelete}
						disabled={isDeleting}
					>
						{isDeleting ? "Excluindo..." : "Excluir"}
					</Button>
					<DialogClose asChild>
						<Button variant="outline">Cancel</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
