"use client";

import {
  BarChart3,
  ChevronDown,
  ChevronUp,
  Settings,
  Target,
  TrendingUp
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export function QuickMenu() {
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLabels, setShowLabels] = useState(false);

  const menuItems = [
    {
      title: "Analytics",
      description: "Progresso e conquistas diárias",
      icon: BarChart3,
      href: "/analytics",
      color: "text-pink-600 bg-pink-50 hover:bg-pink-100",
      shortcut: "A"
    },
    {
      title: "Desempenho",
      description: "Análise de produtividade",
      icon: TrendingUp,
      href: "/analytics?tab=performance",
      color: "text-yellow-600 bg-yellow-50 hover:bg-yellow-100",
      shortcut: "D"
    },
    {
      title: "Organizar",
      description: "Ferramentas de organização",
      icon: Settings,
      href: "/organize",
      color: "text-cyan-600 bg-cyan-50 hover:bg-cyan-100",
      shortcut: "O"
    },
    {
      title: "Métricas",
      description: "Indicadores de performance",
      icon: Target,
      href: "/analytics?tab=performance",
      color: "text-red-600 bg-red-50 hover:bg-red-100",
      shortcut: "M"
    }
  ];

  // Hook para detectar dispositivos móveis
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Hook para capturar teclas de atalho
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!isMobile) return;

      const item = menuItems.find(item =>
        item.shortcut.toLowerCase() === event.key.toLowerCase()
      );

      if (item) {
        event.preventDefault();
        setHoveredItem(item.title);
        // Remove o hover após 3 segundos
        setTimeout(() => setHoveredItem(null), 3000);
      }
    };

    if (isMobile) {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [isMobile, menuItems]);

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
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </Button>
      </div>

      {/* Layout Contraído (Botões Inline) */}
      {!isExpanded && (
        <div className="relative flex justify-center items-center gap-1 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg transition-all duration-300">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isHovered = hoveredItem === item.title;
            return (
              <Link key={item.title} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`
                    relative flex items-center gap-2 text-xs h-7 transition-all duration-200
                    ${item.color}
                    ${isMobile && isHovered ? 'z-10 scale-105' : ''}
                  `}
                  onMouseEnter={() => isMobile && setHoveredItem(item.title)}
                  onMouseLeave={() => isMobile && setHoveredItem(null)}
                >
                  <Icon className="flex-shrink-0 w-3 h-3" />

                  {/* Label com animação de deslizamento aprimorada para mobile */}
                  {isMobile && (
                    <span
                      className={`
                        transition-all duration-400 ease-out overflow-hidden whitespace-nowrap
                        ${isHovered
                          ? 'max-w-32 opacity-100 translate-x-0 scale-100'
                          : 'max-w-0 opacity-0 -translate-x-4 scale-95'
                        }
                      `}
                      style={{
                        transformOrigin: 'left center',
                        transitionProperty: 'max-width, opacity, transform'
                      }}
                    >
                      {item.title}
                    </span>
                  )}

                  {/* Label normal para desktop */}
                  {!isMobile && (
                    <span className="hidden sm:inline">{item.title}</span>
                  )}
                </Button>
              </Link>
            );
          })}

          {/* Tooltip aprimorado com animação de fade-in para mobile */}
          {isMobile && hoveredItem && (
            <div className="right-0 bottom-0 z-50 absolute mb-8 translate-x-2 animate-in duration-300 transform fade-in-0 zoom-in-95">
              <div className="bg-white dark:bg-gray-800 shadow-xl backdrop-blur-sm p-3 border border-gray-200 dark:border-gray-700 rounded-lg min-w-[200px]">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                    {menuItems.find(item => item.title === hoveredItem)?.title}
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-500 dark:text-gray-400 text-xs">
                    {menuItems.find(item => item.title === hoveredItem)?.shortcut}
                  </div>
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-xs">
                  {menuItems.find(item => item.title === hoveredItem)?.description}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Layout Expandido (Cards) */}
      {isExpanded && (
        <div className="relative gap-3 grid grid-cols-2 lg:grid-cols-4 transition-all duration-300">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isHovered = hoveredItem === item.title;
            return (
              <Link key={item.title} href={item.href}>
                <Button
                  variant="ghost"
                  className={`
                    relative h-auto p-4 flex flex-col items-center gap-2 w-full min-h-[80px] md:min-h-[100px]
                    hover:shadow-sm transition-all duration-200
                    ${item.color}
                    ${isMobile && isHovered ? 'z-10 scale-105 shadow-lg' : ''}
                  `}
                  onMouseEnter={() => isMobile && setHoveredItem(item.title)}
                  onMouseLeave={() => isMobile && setHoveredItem(null)}
                >
                  <Icon className="flex-shrink-0 w-6 h-6" />

                  {/* Label com animação de deslizamento aprimorada para mobile */}
                  {isMobile && (
                    <div className="flex flex-col flex-1 justify-center w-full text-center">
                      <div
                        className={`
                          mb-1 font-medium text-sm leading-tight transition-all duration-400 ease-out
                          ${isHovered
                            ? 'opacity-100 translate-y-0 max-h-10 scale-100'
                            : 'opacity-0 -translate-y-3 max-h-0 overflow-hidden scale-95'
                          }
                        `}
                        style={{
                          transformOrigin: 'center top',
                          transitionProperty: 'opacity, transform, max-height'
                        }}
                      >
                        {item.title}
                      </div>
                      <div
                        className={`
                          hidden md:block opacity-75 max-w-full overflow-wrap-anywhere text-xs break-words leading-relaxed whitespace-normal transition-all duration-400 ease-out
                          ${isHovered
                            ? 'opacity-100 translate-y-0 max-h-12 scale-100'
                            : 'opacity-0 -translate-y-3 max-h-0 overflow-hidden scale-95'
                          }
                        `}
                        style={{
                          transformOrigin: 'center top',
                          transitionProperty: 'opacity, transform, max-height'
                        }}
                      >
                        {item.description}
                      </div>
                    </div>
                  )}

                  {/* Layout normal para desktop */}
                  {!isMobile && (
                    <div className="flex flex-col flex-1 justify-center w-full text-center">
                      <div className="mb-1 font-medium text-sm leading-tight">{item.title}</div>
                      <div className="hidden md:block opacity-75 max-w-full overflow-wrap-anywhere text-xs break-words leading-relaxed whitespace-normal">
                        {item.description}
                      </div>
                    </div>
                  )}
                </Button>
              </Link>
            );
          })}

          {/* Tooltip aprimorado com animação de fade-in para mobile */}
          {isMobile && hoveredItem && (
            <div className="right-0 bottom-0 z-50 absolute mb-8 translate-x-2 animate-in duration-300 transform fade-in-0 zoom-in-95">
              <div className="bg-white dark:bg-gray-800 shadow-xl backdrop-blur-sm p-3 border border-gray-200 dark:border-gray-700 rounded-lg min-w-[200px]">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                    {menuItems.find(item => item.title === hoveredItem)?.title}
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-500 dark:text-gray-400 text-xs">
                    {menuItems.find(item => item.title === hoveredItem)?.shortcut}
                  </div>
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-xs">
                  {menuItems.find(item => item.title === hoveredItem)?.description}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}