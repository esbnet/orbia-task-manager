"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BarChart3, 
  Target, 
  TrendingUp, 
  Settings,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

export function QuickMenu() {
  const menuItems = [
    {
      title: "Analytics",
      description: "Relatórios e insights detalhados",
      icon: BarChart3,
      href: "/analytics",
      color: "text-blue-600 bg-blue-50 hover:bg-blue-100"
    },
    {
      title: "Organizar",
      description: "Ferramentas de organização",
      icon: Settings,
      href: "/organize", 
      color: "text-green-600 bg-green-50 hover:bg-green-100"
    },
    {
      title: "Métricas",
      description: "Indicadores de performance",
      icon: Target,
      href: "/analytics?tab=performance",
      color: "text-purple-600 bg-purple-50 hover:bg-purple-100"
    },
    {
      title: "Desempenho",
      description: "Análise de produtividade",
      icon: TrendingUp,
      href: "/analytics?tab=insights",
      color: "text-orange-600 bg-orange-50 hover:bg-orange-100"
    }
  ];

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Acesso Rápido
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.title} href={item.href}>
                <Button
                  variant="ghost"
                  className={`
                    h-auto p-3 flex flex-col items-center gap-2 w-full
                    hover:shadow-sm transition-all duration-200
                    ${item.color}
                  `}
                >
                  <Icon className="w-6 h-6" />
                  <div className="text-center">
                    <div className="font-medium text-sm">{item.title}</div>
                    <div className="text-xs opacity-75 hidden md:block">
                      {item.description}
                    </div>
                  </div>
                  <ChevronRight className="w-3 h-3 opacity-50" />
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}