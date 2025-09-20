"use client";

import React, { createContext, useContext, useState } from "react";
import type { Todo } from "@/types";

interface TodoStateContextType {
  selectedTodo: Todo | null;
  setSelectedTodo: (todo: Todo | null) => void;
  isFormOpen: boolean;
  setIsFormOpen: (open: boolean) => void;
  editingTodo: Todo | null;
  setEditingTodo: (todo: Todo | null) => void;
  filterPriority: string | null;
  setFilterPriority: (priority: string | null) => void;
  filterStatus: string | null;
  setFilterStatus: (status: string | null) => void;
  filterTags: string[];
  setFilterTags: (tags: string[]) => void;
}

const TodoStateContext = createContext<TodoStateContextType | undefined>(undefined);

export function TodoStateProvider({ children }: { children: React.ReactNode }) {
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [filterPriority, setFilterPriority] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterTags, setFilterTags] = useState<string[]>([]);

  const value: TodoStateContextType = {
    selectedTodo,
    setSelectedTodo,
    isFormOpen,
    setIsFormOpen,
    editingTodo,
    setEditingTodo,
    filterPriority,
    setFilterPriority,
    filterStatus,
    setFilterStatus,
    filterTags,
    setFilterTags,
  };

  return (
    <TodoStateContext.Provider value={value}>
      {children}
    </TodoStateContext.Provider>
  );
}

export function useTodoState(): TodoStateContextType {
  const context = useContext(TodoStateContext);
  if (context === undefined) {
    throw new Error("useTodoState deve ser usado dentro de um TodoStateProvider");
  }
  return context;
}