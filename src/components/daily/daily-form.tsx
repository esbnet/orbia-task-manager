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
import type { DailyDifficulty, DailyRepeatType } from "@/types/daily";
import { format, setDefaultOptions } from "date-fns";
import { Calendar as CalendarIcon, SaveIcon, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { useDailyContext } from "@/contexts/daily-context";
import { useTags } from "@/hooks/use-tags";
import type { Daily } from "@/types";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { toast } from "sonner";
import { DailyCard } from "./daily-card";
import { DailySubtaskList } from "./daily-subtask-list";

setDefaultOptions({ locale: ptBR });

interface DailyFormProps {
	daily: Daily;
	dragHandleProps?: unknown;
	onSubmit?: (daily: Omit<Daily, "id" | "createdAt">) => Promise<void>;
	onCancel?: () => void;
	open?: boolean;
}

export function DailyForm({
	daily,
	dragHandleProps,
	onSubmit,
	onCancel,
	open = false,
}: DailyFormProps) {
	const { updateDaily } = useDailyContext();
	const { tagOptions } = useTags();

	const [title, setTitle] = useState(daily.title || "");
	const [observations, setObservations] = useState(daily.observations || "");
	const [tasks] = useState<string[]>(daily.tasks || []);
	const [difficulty, setDifficulty] = useState<DailyDifficulty>(
		daily.difficulty || "Fácil",
	);
	const [startDate, setStartDate] = useState<Date>(
		daily.startDate || new Date(),
	);
	const [repeatType, setRepeatType] = useState<DailyRepeatType>(
		daily.repeat.type || "Semanalmente",
	);
	const [repeatFrequency, setRepeatFrequency] = useState<number>(
		daily.repeat.frequency || 1,
	);
	const [tags, setTags] = useState<string[]>(daily.tags || []);

	const [internalOpen, setInternalOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	// Usar prop externa se fornecida, senão usar estado interno
	const isOpen = open !== undefined ? open : internalOpen;

	async function handleUpdateDaily(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		if (!title.trim()) return;
		if (isLoading) return;

		setIsLoading(true);
		try {
			if (onSubmit && !daily.id) {
				await onSubmit({
					title,
					observations,
					tasks,
					difficulty,
					startDate,
					repeat: {
						type: repeatType as DailyRepeatType,
						frequency: repeatFrequency,
					},
					tags,
				} as Omit<Daily, "id" | "createdAt">);
				setInternalOpen(false);
				if (onCancel) onCancel();
				return;
			}
			await updateDaily({
				...daily,
				title,
				observations,
				tasks,
				difficulty: difficulty,
				startDate,
				repeat: {
					type: repeatType as DailyRepeatType,
					frequency: repeatFrequency,
				},
				tags,
			} as Daily);

			toast.success("Hábito atualizado com sucesso!");
			setInternalOpen(false);
			if (onCancel) onCancel();
		} catch (error) {
			toast.error(`Erro ao atualizar hábito${error}`);
			console.error("Erro ao atualizar hábito", error);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<>
			{/* Só renderizar DailyCard se não estiver usando prop externa open */}
			{open === undefined && (
				<DailyCard
					daily={daily}
					dragHandleProps={dragHandleProps}
					onEditClick={() => setInternalOpen(true)}
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
				<DialogContent className="flex flex-col gap-4 opacity-80 shadow-xl backdrop-blur-sm backdrop-opacity-0">
					<DialogHeader className="flex flex-col gap-1">
						<DialogTitle>Editar</DialogTitle>
						<DialogDescription className="text-zinc-400 text-sm">
							Edite os detalhes da diária
						</DialogDescription>
					</DialogHeader>

					<form
						onSubmit={handleUpdateDaily}
						className="flex flex-col gap-4 bg-gray-100/20 p-2 rounded-lg animate-[fadeIn_1s_ease-in-out_forwards]"
					>
						<div className="flex flex-col gap-1">
							<Label>Título</Label>
							<Input
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="Nova diária"
								required
							/>
						</div>
						<div className="flex flex-col gap-1">
							<Label>Observação</Label>
							<Input
								value={observations}
								onChange={(e) =>
									setObservations(e.target.value)
								}
								placeholder="Adicionar observações"
							/>
						</div>
						<div className="flex flex-col gap-1">
							<Label>Lista de tarefas</Label>
							<DailySubtaskList
								dailyId={daily.id}
								initialSubtasks={daily.subtasks || []}
							/>
						</div>
						<div className="flex flex-col gap-1">
							<Label>Dificuldade</Label>
							<Select
								onValueChange={(value) =>
									setDifficulty(value as DailyDifficulty)
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
									defaultValue={difficulty}
								>
									<SelectItem value="Trivial">
										Trivial ⭐
									</SelectItem>
									<SelectItem value="Fácil">
										Fácil ⭐⭐
									</SelectItem>
									<SelectItem value="Média">
										Média ⭐⭐⭐
									</SelectItem>
									<SelectItem value="Difícil">
										Difícil ⭐⭐⭐⭐
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="flex flex-col gap-1">
							<Label>Data de início</Label>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										data-empty={!startDate}
										className="justify-start w-[280px] font-normal data-[empty=true]:text-muted-foreground text-left"
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
						<div className="flex flex-col gap-1">
							<Label>Repetição</Label>
							<Select
								onValueChange={(value) =>
									setRepeatType(value as DailyRepeatType)
								}
								value={repeatType || "Semanalmente"}
							>
								<SelectTrigger className="w-[180px]">
									<SelectValue
										placeholder="Repetição"
										className="text-zinc-300"
									/>
								</SelectTrigger>
								<SelectContent
									className="w-[180px]"
									defaultValue={repeatType}
								>
									<SelectItem value="Diariamente">
										Diariamente
									</SelectItem>
									<SelectItem value="Semanalmente">
										Semanalmente
									</SelectItem>
									<SelectItem value="Mensalmente">
										Mensalmente
									</SelectItem>
									<SelectItem value="Anualmente">
										Anualmente
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="flex flex-col gap-1">
							<Label>A cada</Label>
							<div className="flex items-center gap-2">
								<Input
									type="number"
									value={repeatFrequency || 1}
									onChange={(e) =>
										setRepeatFrequency(
											e.target.value
												? Number.parseInt(
													e.target.value,
												)
												: 1,
										)
									}
									placeholder="Quantidade de vezes"
									required
								/>
								<span>
									{repeatType === "Diariamente"
										? "Dia"
										: repeatType === "Semanalmente"
											? "Semana"
											: repeatType === "Mensalmente"
												? "Mês"
												: repeatType === "Anualmente"
													? "Ano"
													: ""}
								</span>
							</div>
						</div>
						<div className="flex flex-col gap-1">
							<Label>Etiquetas</Label>
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

						<div className="flex gap-1 mt-2">
							<DialogClose asChild>
								<Button variant="link">Cancel</Button>
							</DialogClose>
							<Button
								type="submit"
								className="flex-1"
								disabled={isLoading}
							>
								<SaveIcon />
								{isLoading ? "Salvando..." : "Salvar"}
							</Button>
						</div>
					</form>
					<div className="flex justify-right items-center">
						<DialogConfirmDelete id={daily.id} />
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}

function DialogConfirmDelete({ id }: { id: string }) {
	const { deleteDaily } = useDailyContext();
	const [isDeleting, setIsDeleting] = useState(false);

	const onDelete = async () => {
		if (isDeleting) return;
		setIsDeleting(true);
		try {
			await deleteDaily(id);
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
