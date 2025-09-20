"use client";

import type { Daily } from "@/domain/entities/daily";
import React from "react";

interface DailyUIState {
  selectedDailies: string[];
  filterDifficulty: Daily["difficulty"] | null;
  filterTags: string[];
  sortBy: "title" | "difficulty" | "createdAt";
  sortOrder: "asc" | "desc";
  showCompleted: boolean;
}

interface DailyUIContextType {
  uiState: DailyUIState;
  setSelectedDailies: (ids: string[]) => void;
  setFilterDifficulty: (difficulty: Daily["difficulty"] | null) => void;
  setFilterTags: (tags: string[]) => void;
  setSortBy: (sortBy: DailyUIState["sortBy"]) => void;
  setSortOrder: (order: DailyUIState["sortOrder"]) => void;
  setShowCompleted: (show: boolean) => void;
  clearFilters: () => void;
}

const DailyUIContext = React.createContext<DailyUIContextType | undefined>(undefined);

const initialState: DailyUIState = {
  selectedDailies: [],
  filterDifficulty: null,
  filterTags: [],
  sortBy: "createdAt",
  sortOrder: "desc",
  showCompleted: true,
};

export function DailyUIProvider({ children }: { children: React.ReactNode }) {
  const [uiState, setUIState] = React.useState<DailyUIState>(initialState);

  const setSelectedDailies = (ids: string[]) => {
    setUIState(prev => ({ ...prev, selectedDailies: ids }));
  };

  const setFilterDifficulty = (difficulty: Daily["difficulty"] | null) => {
    setUIState(prev => ({ ...prev, filterDifficulty: difficulty }));
  };

  const setFilterTags = (tags: string[]) => {
    setUIState(prev => ({ ...prev, filterTags: tags }));
  };

  const setSortBy = (sortBy: DailyUIState["sortBy"]) => {
    setUIState(prev => ({ ...prev, sortBy }));
  };

  const setSortOrder = (order: DailyUIState["sortOrder"]) => {
    setUIState(prev => ({ ...prev, sortOrder: order }));
  };

  const setShowCompleted = (show: boolean) => {
    setUIState(prev => ({ ...prev, showCompleted: show }));
  };

  const clearFilters = () => {
    setUIState(prev => ({
      ...prev,
      filterDifficulty: null,
      filterTags: [],
      selectedDailies: [],
    }));
  };

  const contextValue: DailyUIContextType = {
    uiState,
    setSelectedDailies,
    setFilterDifficulty,
    setFilterTags,
    setSortBy,
    setSortOrder,
    setShowCompleted,
    clearFilters,
  };

  return (
    <DailyUIContext.Provider value={contextValue}>
      {children}
    </DailyUIContext.Provider>
  );
}

export function useDailyUI(): DailyUIContextType {
  const context = React.useContext(DailyUIContext);
  if (context === undefined) {
    throw new Error("useDailyUI must be used within a DailyUIProvider");
  }
  return context;
}