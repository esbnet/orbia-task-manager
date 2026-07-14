"use client";

import type { Tag } from "@/types";
import { useAuthenticatedApi } from "@/hooks/use-authenticated-api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	type ReactNode,
	createContext,
	useContext,
} from "react";

interface TagsContextType {
	tags: Tag[];
	tagOptions: { label: string; value: string; color: string }[];
	isLoading: boolean;
	refetch: () => Promise<void>;
	createTag: (data: Omit<Tag, "id" | "createdAt">) => Promise<Tag>;
	updateTag: (tag: Tag) => Promise<Tag>;
	deleteTag: (id: string) => Promise<void>;
}

const TagsContext = createContext<TagsContextType | undefined>(undefined);

interface TagsProviderProps {
	children: ReactNode;
}

export function TagsProvider({ children }: TagsProviderProps) {
	const queryClient = useQueryClient();
	const { isAuthenticated, assertAuthenticated } = useAuthenticatedApi();

	const {
		data: tags = [],
		isLoading,
		refetch: refetchTags,
	} = useQuery({
		queryKey: ["tags"],
		queryFn: async (): Promise<Tag[]> => {
			const response = await fetch("/api/tags");
			if (!response.ok) {
				throw new Error("Erro ao buscar tags");
			}
			const data = await response.json();
			return data.tags || [];
		},
		enabled: isAuthenticated,
		staleTime: 5 * 60 * 1000,
		gcTime: 5 * 60 * 1000,
		refetchOnWindowFocus: true,
	});

	const tagOptions = tags.map((tag) => ({
		label: tag.name,
		value: tag.name,
		color: tag.color,
	}));

	const createTag = async (data: Omit<Tag, "id" | "createdAt">) => {
		assertAuthenticated();
		const response = await fetch("/api/tags", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});
		const { tag: newTag } = await response.json();
		queryClient.setQueryData<Tag[]>(["tags"], (previous = []) => [...previous, newTag]);
		await queryClient.invalidateQueries({ queryKey: ["tags"] });
		return newTag;
	};

	const updateTag = async (tagToUpdate: Tag) => {
		assertAuthenticated();
		const response = await fetch("/api/tags", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(tagToUpdate),
		});
		const { tag: updatedTag } = await response.json();
		queryClient.setQueryData<Tag[]>(["tags"], (previous = []) =>
			previous.map((tag) => (tag.id === updatedTag.id ? updatedTag : tag)),
		);
		await queryClient.invalidateQueries({ queryKey: ["tags"] });
		return updatedTag;
	};

	const deleteTag = async (id: string) => {
		assertAuthenticated();
		await fetch(`/api/tags?id=${id}`, { method: "DELETE" });
		queryClient.setQueryData<Tag[]>(["tags"], (previous = []) =>
			previous.filter((tag) => tag.id !== id),
		);
		await queryClient.invalidateQueries({ queryKey: ["tags"] });
	};

	const value = {
		tags,
		tagOptions,
		isLoading,
		refetch: async () => {
			await refetchTags();
		},
		createTag,
		updateTag,
		deleteTag,
	};

	return (
		<TagsContext.Provider value={value}>{children}</TagsContext.Provider>
	);
}

export function useTagsContext() {
	const context = useContext(TagsContext);
	if (context === undefined) {
		throw new Error("useTagsContext must be used within a TagsProvider");
	}
	return context;
}

// Hook simplificado para componentes que só precisam das tags
export function useTags() {
	const { tags, tagOptions, isLoading } = useTagsContext();
	return { tags, tagOptions, isLoading };
}
