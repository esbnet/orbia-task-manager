"use client";

import {
  CalendarCheck,
  Dumbbell,
  Grid3X3,
  ListChecks,
  Target
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useState } from "react";

type ColumnType = "all" | "habits" | "dailies" | "todos" | "goals";

interface ColumnFilterProps {
  onFilterChange: (filter: ColumnType) => void;
}

export function ColumnFilter({ onFilterChange }: ColumnFilterProps) {
  const [activeFilter, setActiveFilter] = useState<ColumnType>("all");

  const filters = [
    {
      id: "all",
      label: "Todas",
      icon: Grid3X3,
      color: "text-gray-600 bg-gray-50 hover:bg-gray-100"
    },
    {
      id: "habits",
      label: "Hábitos",
      icon: Dumbbell,
      color: "text-green-600 bg-green-50 hover:bg-green-100"
    },
    {
      id: "dailies",
      label: "Diárias",
      icon: CalendarCheck,
      color: "text-orange-600 bg-orange-50 hover:bg-orange-100"
    },
    {
      id: "todos",
      label: "Afazeres",
      icon: ListChecks,
      color: "text-blue-600 bg-blue-50 hover:bg-blue-100"
    },
    {
      id: "goals",
      label: "Metas",
      icon: Target,
      color: "text-purple-600 bg-purple-50 hover:bg-purple-100"
    }
  ];

  const handleFilterClick = (filterId: ColumnType) => {
    setActiveFilter(filterId);
    onFilterChange(filterId);
  };

  return (
    <div className="flex justify-center items-center self-end gap-2 bg-gray-50 dark:bg-gray-800 mb-4 p-2 rounded-full w-fit">

      {filters.map((filter) => {
        const Icon = filter.icon;
        return (
          <Button
            key={filter.id}
            variant={activeFilter === filter.id ? "default" : "ghost"}
            size="sm"
            onClick={() => handleFilterClick(filter.id as ColumnType)}
            className={`flex xl:flex-1 p-1 rounded-full  items-center gap-1 h-6 w-6 text-xs ${filter.color}`}
          >
            <Icon className="w-3 h-3" />
            <span className="hidden xl:inline">{filter.label}</span>
          </Button>
        );
      })}
    </div>
  );
}