"use client";

import {
  BarChart3,
  ChevronUp,
  Settings,
  Target,
  TrendingUp
} from "lucide-react";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

export function QuickMenu() {
  const [isExpanded, setIsExpanded] = useState(false);

  const menuItems = [
    {
      title: "Analytics",
      description: "Progresso e conquistas diárias",
      icon: BarChart3,
      href: "/analytics",
      color: "text-pink-600 bg-pink-50 hover:bg-pink-100"
    },
    {
      title: "Desempenho",
      description: "Análise de produtividade",
      icon: TrendingUp,
      href: "/analytics?tab=performance",
      color: "text-yellow-600 bg-yellow-50 hover:bg-yellow-100"
    },
    {
      title: "Organizar",
      description: "Ferramentas de organização",
      icon: Settings,
      href: "/organize",
      color: "text-cyan-600 bg-cyan-50 hover:bg-cyan-100"
    },
    {
      title: "Métricas",
      description: "Indicadores de performance",
      icon: Target,
      href: "/analytics?tab=performance",
      color: "text-red-600 bg-red-50 hover:bg-red-100"
    }
  ];

  return (
    <div className="mb-4">
      {/* Botão de Toggle */}
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium text-gray-600 dark:text-gray-400 text-xs">
          Acesso Rápido
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-0 w-6 h-6 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 dark:text-gray-400"
        >
          {isExpanded ? <ChevronUp className="w-3 h-3 transition-all duration-300" /> : <ChevronUp className="w-3 h-3 rotate-180 transition-all duration-300" />}
        </Button>
      </div>

      {/* Layout Contraído (Botões Inline) */}
      {!isExpanded && (
        <div className="relative flex items-center gap-1 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg transition-all duration-300">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.title} href={item.href} className="flex flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`
                    relative flex items-center justify-center gap-2 text-xs h-7 flex-1 transition-all duration-200
                    ${item.color}
                  `}
                >
                  <Icon className="flex-shrink-0 w-3 h-3" />
                  <span className="hidden sm:inline">{item.title}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      )}

      {/* Layout Expandido (Cards) */}
      {isExpanded && (
        <div className="relative gap-3 grid grid-cols-2 lg:grid-cols-4 transition-all duration-300">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.title} href={item.href}>
                <Button
                  variant="ghost"
                  className={`
                    relative h-auto p-4 flex flex-col items-center gap-2 w-full min-h-[80px] md:min-h-[100px]
                    hover:shadow-sm transition-all duration-200
                    ${item.color}
                  `}
                >
                  <Icon className="flex-shrink-0 w-6 h-6" />
                  <div className="flex flex-col flex-1 justify-center w-full text-center">
                    <div className="mb-1 font-medium text-sm leading-tight">{item.title}</div>
                    <div className="hidden md:block opacity-75 max-w-full overflow-wrap-anywhere text-xs break-words leading-relaxed whitespace-normal">
                      {item.description}
                    </div>
                  </div>
                </Button>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}