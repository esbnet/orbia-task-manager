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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { LoaderCircle, SaveIcon, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { Textarea } from "@/components/ui/textarea";
import type { Habit } from "@/domain/entities/habit";
import { useButtonLoading } from "@/hooks/use-button-loading";
import { useDeleteHabit } from "@/hooks/use-habits";
import { useTags } from "@/hooks/use-tags";
import type { HabitFormData } from "@/types/habit";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface HabitFormProps {
	habit?: Habit | null;
	onSubmit: (data: HabitFormData) => void;
	onCancel: () => void;
	open?: boolean;
}

const priorities: Habit["priority"][] = ["Baixa", "Média", "Alta", "Urgente"];
const difficulties: Habit["difficulty"][] = ["Trivial", "Fácil", "Médio", "Difícil"];

export function HabitForm({ habit, onSubmit, onCancel, open = true }: HabitFormProps) {
	const { tagOptions } = useTags();
	const saveLoading = useButtonLoading();
	const [formData, setFormData] = useState<HabitFormData>({
		userId: "",
		title: "",
		observations: "",
		difficulty: "Fácil",
		priority: "Média",
		tags: [],
		reset: "Sempre disponível",
	});
	const queryClient = useQueryClient();
	const deleteHabitMutation = useDeleteHabit();

	useEffect(() => {
		if (habit) {
			// Modo edição: preencher com dados do hábito
			setFormData({
				userId: habit.userId,
				title: habit.title,
				observations: habit.observations,
				difficulty: habit.difficulty,
				priority: habit.priority,
				tags: habit.tags,
				reset: habit.reset || "Sempre disponível",
			});
		} else {
			// Modo criação: resetar para valores padrão
			setFormData({
				userId: "",
				title: "",
				observations: "",
				difficulty: "Fácil",
				priority: "Média",
				tags: [],
				reset: "Sempre disponível",
			});
		}
	}, [habit]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (formData.title.trim()) {
			await saveLoading.executeAsync(async () => {
				await onSubmit(formData);
				// ✅ Limpar formulário após criação bem-sucedida
				if (!habit) {
					setFormData({
						userId: "",
						title: "",
						observations: "",
						difficulty: "Fácil",
						priority: "Média",
						tags: [],
						reset: "Sempre disponível",
					});
				}
			});
		}
	};

	const handleCancel = () => {
		onCancel();
	};


	return (
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle className="font-semibold text-xl">
						{habit ? "Editar Hábito" : "Novo Hábito"}
					</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className={`space-y-4 ${saveLoading.isLoading ? "opacity-50 pointer-events-none" : ""}`}>
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
							placeholder="Digite o título do seu hábito"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="observations">Observações</Label>
						<Textarea
							id="observations"
							value={formData.observations}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									observations: e.target.value,
								}))
							}
							placeholder="Descreva seu hábito em detalhes"
							rows={3}
						/>
					</div>

					<div className="gap-4 grid grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="difficulty">Dificuldade</Label>
							<Select
								value={formData.difficulty}
								onValueChange={(value) =>
									setFormData((prev) => ({
										...prev,
										difficulty: value as Habit["difficulty"],
									}))
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Selecione a dificuldade" />
								</SelectTrigger>
								<SelectContent>
									{difficulties.map((difficulty) => (
										<SelectItem key={difficulty} value={difficulty}>
											{difficulty}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="reset">Disponibilidade</Label>
							<div className="text-sm text-gray-600 dark:text-gray-400 border rounded-md px-3 py-2 bg-muted">
								Sempre disponível (pode ser registrado várias vezes ao dia)
							</div>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="priority">Prioridade</Label>
						<Select
							value={formData.priority}
							onValueChange={(value) =>
								setFormData((prev) => ({
									...prev,
									priority: value as Habit["priority"],
								}))
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Selecione a prioridade" />
							</SelectTrigger>
							<SelectContent>
								{priorities.map((priority) => (
									<SelectItem key={priority} value={priority}>
										{priority}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label>Etiquetas</Label>
						<MultiSelect
							key={`tags-${tagOptions.length}`}
							id="tags"
							options={tagOptions}
							onValueChange={(value) => setFormData((prev) => ({ ...prev, tags: value }))}
							defaultValue={formData.tags}
							placeholder="Adicionar etiquetas"
							variant="inverted"
							maxCount={3}
						/>
					</div>

					<div className="flex justify-end gap-2 pt-4">
						<Button type="button" variant="outline" onClick={handleCancel}>
							Cancelar
						</Button>
						<Button type="submit" disabled={saveLoading.isLoading} className="flex-1">
							{saveLoading.isLoading ?
								<LoaderCircle className="animate-spin" /> :
								<><SaveIcon />Salvar</>
							}
						</Button>
					</div>
				</form>

				{/* Botão de delete - só aparece no modo edição */}
				{habit && habit.id && (
					<div className="flex justify-center items-center mt-4 w-full">
						<DialogConfirmDelete
							id={habit.id}
							onDeleted={onCancel}
						/>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}

function DialogConfirmDelete({ id, onDeleted }: { id: string; onDeleted?: () => void }) {
	const [open, setOpen] = useState(false);
	const deleteHabitMutation = useDeleteHabit();

	const onDelete = async () => {
		try {
			await deleteHabitMutation.mutateAsync(id);
			toast.success("Hábito excluído com sucesso!");
			setOpen(false); // Fechar dialog após exclusão bem-sucedida
			onDeleted?.(); // Notificar componente pai
		} catch (error) {
			toast.error("Erro ao excluir hábito. Tente novamente.");
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
					Deletar este hábito
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
						disabled={deleteHabitMutation.isPending}
					>
						{deleteHabitMutation.isPending ? "Excluindo..." : "Excluir"}
					</Button>
					<DialogClose asChild>
						<Button variant="outline">Cancelar</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
