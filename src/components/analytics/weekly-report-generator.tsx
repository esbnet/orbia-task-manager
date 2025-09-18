"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Download, 
  Mail, 
  TrendingUp, 
  Clock, 
  Target,
  Award,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import { useAdvancedAnalytics } from "@/hooks/use-advanced-analytics";

export function WeeklyReportGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { data: analytics } = useAdvancedAnalytics("week");

  const generateReport = async () => {
    setIsGenerating(true);
    // Simular geração de relatório
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
    
    // Aqui você implementaria a geração real do PDF
    console.log("Relatório gerado!");
  };

  const sendByEmail = async () => {
    // Implementar envio por email
    console.log("Enviando por email...");
  };

  if (!analytics) return null;

  const currentWeek = analytics.weeklyReports[0];
  const completionRate = Math.round((currentWeek.completedTasks / currentWeek.totalTasks) * 100);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Relatório Semanal Automático
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={sendByEmail}
              disabled={isGenerating}
            >
              <Mail className="w-4 h-4 mr-2" />
              Enviar Email
            </Button>
            <Button 
              size="sm" 
              onClick={generateReport}
              disabled={isGenerating}
            >
              <Download className="w-4 h-4 mr-2" />
              {isGenerating ? "Gerando..." : "Gerar PDF"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Target className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold text-blue-600">{completionRate}%</p>
              <p className="text-sm text-blue-700">Taxa de Conclusão</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold text-green-600">{currentWeek.completedTasks}</p>
              <p className="text-sm text-green-700">Tarefas Concluídas</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Clock className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold text-purple-600">{currentWeek.totalTime}min</p>
              <p className="text-sm text-purple-700">Tempo Total</p>
            </div>
            
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <Award className="w-6 h-6 mx-auto mb-2 text-orange-600" />
              <p className="text-2xl font-bold text-orange-600">{currentWeek.averageDaily}</p>
              <p className="text-sm text-orange-700">Média Diária</p>
            </div>
          </div>

          {/* Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                Destaques Positivos
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {currentWeek.bestDay}
                  </Badge>
                  <span className="text-sm">foi seu melhor dia</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {currentWeek.topCategories[0]}
                  </Badge>
                  <span className="text-sm">categoria mais produtiva</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                Áreas de Melhoria
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    {currentWeek.worstDay}
                  </Badge>
                  <span className="text-sm">precisa de mais atenção</span>
                </div>
                {completionRate < 80 && (
                  <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      Meta
                    </Badge>
                    <span className="text-sm">aumentar taxa de conclusão</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium mb-3">Recomendações para Próxima Semana</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>Foque em manter a consistência nos dias de maior produtividade</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">•</span>
                <span>Continue priorizando a categoria "{currentWeek.topCategories[0]}"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500">•</span>
                <span>Planeje atividades mais leves para {currentWeek.worstDay}</span>
              </li>
            </ul>
          </div>

          {/* Auto-generation Settings */}
          <div className="p-4 border border-dashed rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Relatórios Automáticos</h4>
                <p className="text-sm text-muted-foreground">
                  Receba relatórios semanais por email toda segunda-feira
                </p>
              </div>
              <Button variant="outline" size="sm">
                Configurar
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}