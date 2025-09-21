"use client";

import { Button } from "@/components/ui/button";
import { 
  Dumbbell, 
  CalendarCheck, 
  ListChecks, 
  Target,
  Grid3X3
} from "lucide-react";
import { useState } from "react";

type ColumnType = "all" | "habits" | "dailies" | "todos" | "goals";

interface ColumnFilterProps {
  onFilterChange: (filter: ColumnType) => void;
}

export function ColumnFilter({ onFilterChange }: ColumnFilterProps) {
  const [activeFilter, setActiveFilter] = useState<ColumnType>("all");

  const filters = [
    { id: "all", label: "Todas", icon: Grid3X3 },
    { id: "habits", label: "Hábitos", icon: Dumbbell },
    { id: "dailies", label: "Diárias", icon: CalendarCheck },
    { id: "todos", label: "Afazeres", icon: ListChecks },
    { id: "goals", label: "Metas", icon: Target }
  ];

  const handleFilterClick = (filterId: ColumnType) => {
    setActiveFilter(filterId);
    onFilterChange(filterId);
  };

  return (
    <div className="flex items-center gap-1 p-1 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
      {filters.map((filter) => {
        const Icon = filter.icon;
        return (
          <Button
            key={filter.id}
            variant={activeFilter === filter.id ? "default" : "ghost"}
            size="sm"
            onClick={() => handleFilterClick(filter.id as ColumnType)}
            className="flex items-center gap-1 text-xs h-7"
          >
            <Icon className="w-3 h-3" />
            <span className="hidden sm:inline">{filter.label}</span>
          </Button>
        );
      })}
    </div>
  );
}