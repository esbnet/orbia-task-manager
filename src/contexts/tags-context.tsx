"use client";

import type { Tag } from "@/types";
import {
	type ReactNode,
	createContext,
	useContext,
	useEffect,
	useState,
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
	const [tags, setTags] = useState<Tag[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [lastFetch, setLastFetch] = useState<number>(0);

	const fetchTags = async (force = false) => {
		// Cache por 5 minutos
		const now = Date.now();
		if (!force && tags.length > 0 && now - lastFetch < 5 * 60 * 1000) {
			return;
		}

		try {
			setIsLoading(true);
			const response = await fetch("/api/tags");
			const data = await response.json();
			setTags(data.tags || []);
			setLastFetch(now);
		} catch (error) {
			setTags([]);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchTags();
	}, []);

	const tagOptions = tags.map((tag) => ({
		label: tag.name,
		value: tag.name,
		color: tag.color,
	}));

	const createTag = async (data: Omit<Tag, "id" | "createdAt">) => {
		const response = await fetch("/api/tags", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});
		const newTag = await response.json();
		setTags(prev => [...prev, newTag]);
		return newTag;
	};

	const updateTag = async (tagToUpdate: Tag) => {
		const response = await fetch("/api/tags", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(tagToUpdate),
		});
		const { tag: updatedTag } = await response.json();
		setTags(prev =>
			prev.map(tag => {
				if (tag.id === updatedTag.id) {
					return updatedTag;
				}
				return tag;
			}),
		);
		return updatedTag;
	};

	const deleteTag = async (id: string) => {
		await fetch(`/api/tags?id=${id}`, { method: "DELETE" });
		setTags(prev => prev.filter(t => t.id !== id));
	};

	const value = {
		tags,
		tagOptions,
		isLoading,
		refetch: fetchTags,
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
