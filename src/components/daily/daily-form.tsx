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
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { useDailyState } from "@/contexts/daily-state-context";
import { useTags } from "@/hooks/use-tags";
import { useTranslation } from "@/hooks/use-translation";
import type { Daily } from "@/types";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { DailyCard } from "./daily-card";
import { DailySubtaskList } from "./daily-subtask-list";

setDefaultOptions({ locale: ptBR });

interface DailyFormProps {
	daily: Daily;
	onSubmit?: (daily: Omit<Daily, "id" | "createdAt">) => Promise<void>;
	onCancel?: () => void;
	open?: boolean;
}

export function DailyForm({
	daily,
	onSubmit,
	onCancel,
	open = false,
}: DailyFormProps) {
	const { updateDaily } = useDailyState();
	const { tagOptions } = useTags();
	const { t } = useTranslation();

	const [title, setTitle] = useState(daily.title || "");
	const [observations, setObservations] = useState(daily.observations || "");
	const [tasks] = useState<string[]>(daily.tasks || []);
	const [difficulty, setDifficulty] = useState<DailyDifficulty>(
		daily.difficulty || t('difficulty.easy'),
	);
	const [startDate, setStartDate] = useState<Date>(
		daily.startDate || new Date(),
	);
	const [repeatType, setRepeatType] = useState<DailyRepeatType>(
		daily.repeat.type || t('repeat.weekly'),
	);
	const [repeatFrequency, setRepeatFrequency] = useState<number>(
		daily.repeat.frequency || 1,
	);
	const [tags, setTags] = useState<string[]>(daily.tags || []);

	const [internalOpen, setInternalOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	// Sincronizar estados com o prop daily quando ele muda
	useEffect(() => {
		setTitle(daily.title || "");
		setObservations(daily.observations || "");
		setDifficulty(daily.difficulty || t('difficulty.easy'));
		setStartDate(daily.startDate || new Date());
		setRepeatType(daily.repeat?.type || t('repeat.weekly'));
		setRepeatFrequency(daily.repeat?.frequency || 1);
		setTags(daily.tags || []);
	}, [daily]);

	// Usar prop externa se fornecida, senão usar estado interno
	const isOpen = open !== undefined ? open : internalOpen;

	async function handleUpdateDaily(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		if (!title.trim()) return;
		if (isLoading) return;

		setIsLoading(true);
		try {
			// Se for um daily mock, criar um novo daily real
			if (daily.id.startsWith('mock-')) {
				if (onSubmit) {
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
					toast.success(t("messages.dailyCreated"));
					setInternalOpen(false);
					if (onCancel) onCancel();
					return;
				}
			}

			// Para todos os casos (criação e edição), usar a função onSubmit se fornecida
			if (onSubmit) {
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

				// console.log('DailyForm: onSubmit executado com sucesso');
				toast.success(daily.id.startsWith('mock-') || !daily.id ? t("messages.dailyCreated") : t("messages.dailyUpdated"));
				setInternalOpen(false);
				if (onCancel) onCancel();
				return;
			}

			// Fallback: usar contexto diretamente se onSubmit não for fornecida
			// console.log('DailyForm: Usando contexto diretamente (fallback)');
			await updateDaily(daily.id, {
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

			toast.success(t("messages.dailyUpdated"));
			setInternalOpen(false);
			if (onCancel) onCancel();
		} catch (error) {
			toast.error(`${t("messages.errorSaving")}: ${error}`);
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
						<DialogTitle>{t("forms.editDaily")}</DialogTitle>
						<DialogDescription className="text-zinc-400 text-sm">
							{t("forms.editDetails")}
						</DialogDescription>
					</DialogHeader>

					<form
						onSubmit={handleUpdateDaily}
						className="flex flex-col gap-4 bg-gray-100/20 p-2 rounded-lg animate-[fadeIn_1s_ease-in-out_forwards]"
					>
						<div className="flex flex-col gap-1">
							<Label>{t("forms.title")}</Label>
							<Input
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder={t("forms.newDaily")}
								required
							/>
						</div>
						<div className="flex flex-col gap-1">
							<Label>{t("forms.observations")}</Label>
							<Input
								value={observations}
								onChange={(e) =>
									setObservations(e.target.value)
								}
								placeholder={t("forms.addObservations")}
							/>
						</div>
						<div className="flex flex-col gap-1">
							<Label>{t("forms.taskList")}</Label>
							<DailySubtaskList
								dailyId={daily.id}
								initialSubtasks={daily.subtasks || []}
							/>
						</div>
						<div className="flex flex-col gap-1">
							<Label>{t("forms.difficulty")}</Label>
							<Select
								onValueChange={(value) =>
									setDifficulty(value as DailyDifficulty)
								}
								value={difficulty || "Fácil"}
							>
								<SelectTrigger className="w-full">
									<SelectValue
										placeholder={t("forms.difficulty")}
										className="text-zinc-300"
									/>
								</SelectTrigger>
								<SelectContent
									className="w-full"
									defaultValue={difficulty}
								>
									<SelectItem value="Trivial">
										{t("difficulty.trivial")} ⭐
									</SelectItem>
									<SelectItem value="Fácil">
										{t("difficulty.easy")} ⭐⭐
									</SelectItem>
									<SelectItem value="Média">
										{t("difficulty.medium")} ⭐⭐⭐
									</SelectItem>
									<SelectItem value="Difícil">
										{t("difficulty.hard")} ⭐⭐⭐⭐
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="flex flex-col gap-1">
							<Label>{t("forms.startDate")}</Label>
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
											<span>{t("common.pickDate")}</span>
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
							<Label>{t("forms.repeat")}</Label>
							<Select
								onValueChange={(value) =>
									setRepeatType(value as DailyRepeatType)
								}
								value={repeatType || "Semanalmente"}
							>
								<SelectTrigger className="w-[180px]">
									<SelectValue
										placeholder={t("forms.repeat")}
										className="text-zinc-300"
									/>
								</SelectTrigger>
								<SelectContent
									className="w-[180px]"
									defaultValue={repeatType}
								>
									<SelectItem value="Diariamente">
										{t("repeat.daily")}
									</SelectItem>
									<SelectItem value="Semanalmente">
										{t("repeat.weekly")}
									</SelectItem>
									<SelectItem value="Mensalmente">
										{t("repeat.monthly")}
									</SelectItem>
									<SelectItem value="Anualmente">
										{t("repeat.yearly")}
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="flex flex-col gap-1">
							<Label>{t("forms.every")}</Label>
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
									{repeatType === t("repeat.daily")
										? t("repeat.day")
										: repeatType === t("repeat.weekly")
											? t("repeat.week")
											: repeatType === t("repeat.monthly")
												? t("repeat.month")
												: repeatType === t("repeat.yearly")
													? t("repeat.year")
													: ""}
								</span>
							</div>
						</div>
						<div className="flex flex-col gap-1">
							<Label>{t('forms.tags')}</Label>
							<MultiSelect
								key={`tags-${tagOptions.length}`}
								id="tags"
								options={tagOptions}
								onValueChange={(value) => setTags(value)}
								defaultValue={tags || []}
								placeholder="Adicionar etiquetas"
								variant="inverted"
								maxCount={3}
							/>
						</div>

						<div className="flex justify-end gap-1 mt-2">
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
	const { deleteDaily } = useDailyState();
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
