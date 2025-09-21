"use client";

import React, { createContext, useContext, useState } from "react";
import type { Daily } from "@/domain/entities/daily";

interface DailyStateContextType {
  selectedDaily: Daily | null;
  setSelectedDaily: (daily: Daily | null) => void;
  isFormOpen: boolean;
  setIsFormOpen: (open: boolean) => void;
  editingDaily: Daily | null;
  setEditingDaily: (daily: Daily | null) => void;
  filterDifficulty: string | null;
  setFilterDifficulty: (difficulty: string | null) => void;
  filterRepeatType: string | null;
  setFilterRepeatType: (repeatType: string | null) => void;
}

const DailyStateContext = createContext<DailyStateContextType | undefined>(undefined);

export function DailyStateProvider({ children }: { children: React.ReactNode }) {
  const [selectedDaily, setSelectedDaily] = useState<Daily | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDaily, setEditingDaily] = useState<Daily | null>(null);
  const [filterDifficulty, setFilterDifficulty] = useState<string | null>(null);
  const [filterRepeatType, setFilterRepeatType] = useState<string | null>(null);

  const value: DailyStateContextType = {
    selectedDaily,
    setSelectedDaily,
    isFormOpen,
    setIsFormOpen,
    editingDaily,
    setEditingDaily,
    filterDifficulty,
    setFilterDifficulty,
    filterRepeatType,
    setFilterRepeatType,
  };

  return (
    <DailyStateContext.Provider value={value}>
      {children}
    </DailyStateContext.Provider>
  );
}

export function useDailyState(): DailyStateContextType {
  const context = useContext(DailyStateContext);
  if (context === undefined) {
    throw new Error("useDailyState deve ser usado dentro de um DailyStateProvider");
  }
  return context;
}