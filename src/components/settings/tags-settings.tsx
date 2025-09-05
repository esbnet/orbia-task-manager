"use client";

import { Edit, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTags } from "@/hooks/use-tags";
import type { Tag } from "@/types";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Separator } from "../ui/separator";

// Zod schemas for validation
const tagNameSchema = z.string()
	.min(1, "Nome da tag é obrigatório")
	.min(2, "Nome deve ter pelo menos 2 caracteres")
	.max(50, "Nome deve ter no máximo 50 caracteres")
	.regex(/^[A-Za-zÀ-ÖØ-öø-ÿ0-9&*%$#@+\-/ ]+$/, "Nome contém caracteres inválidos");

const tagColorSchema = z.string()
	.min(1, "Cor é obrigatória")
	.regex(/^#[0-9A-Fa-f]{6}$/, "Formato de cor inválido");

const createTagSchema = z.object({
	name: tagNameSchema,
	color: tagColorSchema,
});

const updateTagSchema = z.object({
	name: tagNameSchema,
	color: tagColorSchema,
});

export function TagsSettings() {
	const { data: session } = useSession();
	const { tags, createTag, updateTag: updateTagContext, deleteTag: deleteTagContext } = useTags();
	const [newTagName, setNewTagName] = useState("");
	const [newTagColor, setNewTagColor] = useState("#3b82f6");
	const [editingTag, setEditingTag] = useState<Tag | null>(null);
	const [validationErrors, setValidationErrors] = useState<{ name?: string; color?: string }>({});

	const validateTag = (name: string, color: string, isEditing = false) => {
		const errors: { name?: string; color?: string } = {};

		// Validate with Zod schemas
		const nameResult = tagNameSchema.safeParse(name.trim());
		const colorResult = tagColorSchema.safeParse(color);

		if (!nameResult.success) {
			errors.name = nameResult.error.issues[0]?.message;
		} else if (!isEditing && tags.some(tag => tag.name.toLowerCase() === name.trim().toLowerCase())) {
			errors.name = "Já existe uma tag com este nome";
		}

		if (!colorResult.success) {
			errors.color = colorResult.error.issues[0]?.message;
		}

		return errors;
	};

	const addTag = async () => {
		const errors = validateTag(newTagName, newTagColor);
		setValidationErrors(errors);

		if (Object.keys(errors).length > 0) return;

		try {
			await createTag({
				name: newTagName.trim(),
				color: newTagColor,
				userId: session?.user?.id || "temp-dev-user",
			});
			setNewTagName("");
			setNewTagColor("#3b82f6");
			setValidationErrors({});
			toast.success("Tag criada com sucesso!");
		} catch (error) {
			toast.error("Erro ao criar tag");
		}
	};

	const updateTag = async () => {
		if (!editingTag) return;

		const errors = validateTag(editingTag.name, editingTag.color, true);
		setValidationErrors(errors);

		if (Object.keys(errors).length > 0) return;

		try {
			await updateTagContext({
				...editingTag,
				name: editingTag.name.trim(),
			});
			setEditingTag(null);
			setValidationErrors({});
			toast.success("Tag atualizada com sucesso!");
		} catch (error) {
			toast.error("Erro ao atualizar tag");
		}
	};

	const deleteTag = async (id: string, name: string) => {
		try {
			await deleteTagContext(id);
			toast.success(`Tag "${name}" removida com sucesso!`);
		} catch (error) {
			toast.error("Erro ao remover tag");
		}
	};

	const handleNewTagNameChange = (value: string) => {
		setNewTagName(value);
		if (validationErrors.name) {
			setValidationErrors(prev => ({ ...prev, name: undefined }));
		}
	};

	const handleNewTagColorChange = (value: string) => {
		setNewTagColor(value);
		if (validationErrors.color) {
			setValidationErrors(prev => ({ ...prev, color: undefined }));
		}
	};

	const handleEditingTagNameChange = (value: string) => {
		if (editingTag) {
			setEditingTag({ ...editingTag, name: value });
			if (validationErrors.name) {
				setValidationErrors(prev => ({ ...prev, name: undefined }));
			}
		}
	};

	const handleEditingTagColorChange = (value: string) => {
		if (editingTag) {
			setEditingTag({ ...editingTag, color: value });
			if (validationErrors.color) {
				setValidationErrors(prev => ({ ...prev, color: undefined }));
			}
		}
	};

	return (
		<div className="space-y-6">
			<div>
				<h2 className="mb-2 font-semibold text-2xl">Gerenciar Tags</h2>
				<p className="mb-6 text-muted-foreground">
					Crie e gerencie tags para organizar suas tarefas, hábitos e
					atividades diárias.
				</p>
			</div>

			{/* Adicionar nova tag */}
			<div className="flex items-end gap-4">
				<div className="flex flex-col flex-1 gap-2">
					<Label htmlFor="tagName">Nome da Tag</Label>
					<Input
						id="tagName"
						value={newTagName}
						onChange={(e) => handleNewTagNameChange(e.target.value)}
						placeholder="Digite o nome da tag..."
						onKeyDown={(e) => e.key === "Enter" && addTag()}
						className={validationErrors.name ? "border-destructive" : ""}
					/>
					{validationErrors.name && (
						<p className="text-destructive text-sm">{validationErrors.name}</p>
					)}
				</div>
				<div className="flex flex-col gap-2">
					<Label htmlFor="tagColor">Cor</Label>
					<Input
						id="tagColor"
						type="color"
						value={newTagColor}
						onChange={(e) => handleNewTagColorChange(e.target.value)}
						className={`w-20 h-10 ${validationErrors.color ? "border-destructive" : ""}`}
					/>
					{validationErrors.color && (
						<p className="text-destructive text-sm">{validationErrors.color}</p>
					)}
				</div>
				<Button onClick={addTag}>
					<Plus size={16} />
					Adicionar
				</Button>
			</div>

			<Separator className="my-6" />

			{/* Lista de tags */}
			<div className="space-y-4">
				<h3 className="font-medium text-lg">Tags Existentes</h3>
				<div className="gap-2 grid">
					{tags.map((tag: Tag) => (
						<div
							key={tag.id}
							className="flex justify-between items-center p-3 border rounded-lg"
						>
							{editingTag?.id === tag.id && editingTag ? (
								<div className="flex flex-1 items-center gap-2">
									<div className="flex flex-col flex-1 gap-1">
										<Input
											value={editingTag.name || ""}
											onChange={(e) => handleEditingTagNameChange(e.target.value)}
											className={`flex-1 ${validationErrors.name ? "border-destructive" : ""}`}
										/>
										{validationErrors.name && (
											<p className="text-destructive text-xs">{validationErrors.name}</p>
										)}
									</div>
									<div className="flex flex-col gap-1">
										<Input
											type="color"
											value={editingTag.color || "#3b82f6"}
											onChange={(e) => handleEditingTagColorChange(e.target.value)}
											className={`w-16 ${validationErrors.color ? "border-destructive" : ""}`}
										/>
										{validationErrors.color && (
											<p className="text-destructive text-xs">{validationErrors.color}</p>
										)}
									</div>
									<Button onClick={updateTag} size="sm">
										Salvar
									</Button>
									<Button
										onClick={() => {
											setEditingTag(null);
											setValidationErrors({});
										}}
										variant="outline"
										size="sm"
									>
										Cancelar
									</Button>
								</div>
							) : (
								<>
									<div className="flex items-center gap-3">
										<Badge
											style={{
												backgroundColor: tag.color,
												color: "white",
											}}
										>
											{tag.name}
										</Badge>
									</div>
									<div className="flex gap-2">
										<Button
											onClick={() => {
												setEditingTag(tag);
												setValidationErrors({});
											}}
											size="sm"
											variant="ghost"
										>
											<Edit size={14} />
										</Button>
										<Button
											onClick={() =>
												deleteTag(tag.id, tag.name)
											}
											size="sm"
											variant="ghost"
											className="text-destructive"
										>
											<Trash2 size={14} />
										</Button>
									</div>
								</>
							)}
						</div>
					))}
				</div>
			</div>
		</div >
	);
}
