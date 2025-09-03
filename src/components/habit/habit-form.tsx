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
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import type { Habit } from "@/domain/entities/habit";
import type { HabitFormData } from "@/types/habit";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useTags } from "@/hooks/use-tags";

interface HabitFormProps {
	habit?: Habit | null;
	onSubmit: (data: HabitFormData) => void;
	onCancel: () => void;
	open?: boolean;
}

const priorities: Habit["priority"][] = ["Baixa", "Média", "Alta", "Urgente"];
const difficulties: Habit["difficulty"][] = ["Trivial", "Fácil", "Médio", "Difícil"];
const resetOptions: Habit["reset"][] = ["Diariamente", "Semanalmente", "Mensalmente"];

export function HabitForm({ habit, onSubmit, onCancel, open = true }: HabitFormProps) {
	const { tagOptions } = useTags();
	const [formData, setFormData] = useState<HabitFormData>({
		userId: "",
		title: "",
		observations: "",
		difficulty: "Fácil",
		priority: "Média",
		tags: [],
		reset: "Diariamente",
	});
	const queryClient = useQueryClient();

	// Função para invalidar queries após exclusão
	const handleDeleteSuccess = () => {
		queryClient.invalidateQueries({ queryKey: ["habits", "list"] });
		queryClient.invalidateQueries({ queryKey: ["habits", "detail", habit?.id] });
		onCancel();
	};

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
				reset: habit.reset,
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
				reset: "Diariamente",
			});
		}
	}, [habit]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (formData.title.trim()) {
			onSubmit(formData);
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
							<Label htmlFor="reset">Frequência de Reset</Label>
							<Select
								value={formData.reset}
								onValueChange={(value) =>
									setFormData((prev) => ({
										...prev,
										reset: value as Habit["reset"],
									}))
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Selecione a frequência" />
								</SelectTrigger>
								<SelectContent>
									{resetOptions.map((reset) => (
										<SelectItem key={reset} value={reset}>
											{reset}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
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
						<Button type="submit">
							{habit ? "Atualizar" : "Criar"} Hábito
						</Button>
					</div>
				</form>

				{/* Botão de delete - só aparece no modo edição */}
				{habit && habit.id && (
					<div className="flex justify-center items-center mt-4 w-full">
						<DialogConfirmDelete
							id={habit.id}
							onDeleteSuccess={handleDeleteSuccess}
						/>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}

function DialogConfirmDelete({ id, onDeleteSuccess }: { id: string; onDeleteSuccess?: () => void }) {
	const [isDeleting, setIsDeleting] = useState(false);
	// const deleteHabitMutation = useDeleteHabit();

	const onDelete = async () => {
		if (isDeleting) return;
		setIsDeleting(true);
		try {
			const response = await fetch(`/api/habits?id=${id}`, {
				method: "DELETE",
			});
			if (!response.ok) {
				throw new Error("Erro ao excluir hábito");
			}

			toast.success("Hábito excluído com sucesso!");
			onDeleteSuccess?.();
		} catch (error) {
			toast.error("Erro ao excluir hábito. Tente novamente.");
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


