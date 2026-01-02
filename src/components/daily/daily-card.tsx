import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Archive,
	Calendar,
	CheckCircle,
	ChevronDown,
	Clock,
	Edit,
	LoaderCircle,
	RotateCcw,
	Tag
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DailyPeriodCalculator } from "@/domain/services/daily-period-calculator";
import { useCompleteDaily } from "@/hooks/use-dailies";
import { useArchiveDaily } from "@/hooks/use-archive-daily";
import { useTranslation } from "@/hooks/use-translation";
import { useState } from "react";
import { toast } from "sonner";
import type { Daily } from "../../types";

interface DailyCardProps {
	daily: Daily;
	onEdit?: (daily: Daily) => void;
	isCompleted?: boolean;
	nextAvailableAt?: Date | string;
}

const difficultyConfig = {
	"Trivial": { color: "bg-gray-100/80 dark:bg-gray-800/80 text-gray-800 dark:text-gray-200", stars: "⭐" },
	"Fácil": { color: "bg-green-100/80 dark:bg-green-900/30 text-green-800 dark:text-green-200", stars: "⭐⭐" },
	"Médio": { color: "bg-yellow-100/80 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200", stars: "⭐⭐⭐" },
	"Difícil": { color: "bg-red-100/80 dark:bg-red-900/30 text-red-800 dark:text-red-200", stars: "⭐⭐⭐⭐" },
};

const repeatTypeConfig = {
	"Diariamente": { icon: RotateCcw, color: "text-blue-600 dark:text-blue-400" },
	"Semanalmente": { icon: Calendar, color: "text-green-600 dark:text-green-400" },
	"Mensalmente": { icon: Calendar, color: "text-purple-600 dark:text-purple-400" },
	"Anualmente": { icon: Calendar, color: "text-orange-600 dark:text-orange-400" },
};

export function DailyCard({
	daily,
	onEdit,
	isCompleted = false
}: DailyCardProps) {
	const completeDaily = useCompleteDaily();
	const archiveDaily = useArchiveDaily();
	const [isExpanded, setIsExpanded] = useState(false);
	const difficulty = difficultyConfig[daily.difficulty as keyof typeof difficultyConfig] || difficultyConfig["Fácil"];
	const repeatConfig = repeatTypeConfig[daily.repeat?.type as keyof typeof repeatTypeConfig] || repeatTypeConfig["Diariamente"];
	const RepeatIcon = repeatConfig.icon;

	const { t } = useTranslation();

	const getDifficultyLabel = (difficulty: string) => {
		switch (difficulty) {
			case "Trivial": return t("difficulty.trivial");
			case "Fácil": return t("difficulty.easy");
			case "Médio": return t("difficulty.medium");
			case "Difícil": return t("difficulty.hard");
			default: return difficulty;
		}
	};

	const getRepeatLabel = (repeatType: string) => {
		switch (repeatType) {
			case "Diariamente": return t("repeat.daily");
			case "Semanalmente": return t("repeat.weekly");
			case "Mensalmente": return t("repeat.monthly");
			case "Anualmente": return t("repeat.yearly");
			default: return repeatType;
		}
	};

	const handleComplete = async () => {
		if (completeDaily.isPending) return;

		try {
			await completeDaily.mutateAsync(daily.id);
			toast.success(`Tarefa "${daily.title}" concluída com sucesso!`);
		} catch (error) {
			toast.error("Erro ao completar tarefa. Tente novamente.");
		}
	};

	const handleArchive = async () => {
		if (archiveDaily.isPending) return;

		try {
			await archiveDaily.mutateAsync(daily.id);
			toast.success(`Tarefa "${daily.title}" arquivada!`);
		} catch (error) {
			toast.error("Erro ao arquivar tarefa.");
		}
	};

	const formatNextAvailable = (date: Date | string) => {
		const now = new Date();
		const targetDate = typeof date === 'string' ? new Date(date) : date;
		const diffMs = targetDate.getTime() - now.getTime();
		const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

		if (diffHours < 24) {
			return `${diffHours}h`;
		} else {
			const diffDays = Math.ceil(diffHours / 24);
			return `${diffDays}d`;
		}
	};

	const calculateNextAvailableDate = () => {
		if (!daily.repeat) return null;

		// Usar a última data de conclusão se disponível, senão usar a data atual
		const referenceDate = daily.lastCompletedDate ? new Date(daily.lastCompletedDate) : new Date();

		return DailyPeriodCalculator.calculateNextStartDate(
			daily.repeat.type as "Diariamente" | "Semanalmente" | "Mensalmente" | "Anualmente",
			referenceDate,
			daily.repeat.frequency
		);
	};

	const calculatedNextAvailableAt = calculateNextAvailableDate();

	return (
		<Card className={`hover:shadow-md gap-0  transition-shadow duration-200 relative overflow-hidden ${completeDaily.isPending ? "opacity-50 pointer-events-none" : ""}`}>
			{/* Barra de controles fixa no canto superior direito */}
			<div className="absolute top-2 right-2 flex items-center gap-1 z-10">
				{!isCompleted && (
					<Button
						className="hover:bg-amber-100 dark:hover:bg-amber-900/30 border border-amber-200/50 dark:border-amber-700/50 p-2 rounded-full w-7 h-7 text-amber-600"
						title={t("actions.complete")}
						onClick={handleComplete}
						size="icon"
						variant="ghost"
						disabled={completeDaily.isPending}
					>
						{completeDaily.isPending ? (
							<LoaderCircle className="w-3 h-3 text-amber-600 animate-spin" />
						) : (
							<CheckCircle className="w-3 h-3" />
						)}
					</Button>
				)}

				<Button
					className="hover:bg-orange-100 dark:hover:bg-orange-900/30 border border-orange-200/50 dark:border-orange-700/50 p-2 rounded-full w-7 h-7 text-orange-600"
					title="Arquivar"
					onClick={handleArchive}
					size="icon"
					variant="ghost"
					disabled={archiveDaily.isPending}
				>
					{archiveDaily.isPending ? (
						<LoaderCircle className="w-3 h-3 text-orange-600 animate-spin" />
					) : (
						<Archive className="w-3 h-3" />
					)}
				</Button>

				{onEdit && (
					<Button
						className="hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200/50 dark:border-gray-600/50 p-2 rounded-full w-7 h-7 text-gray-600"
						title={t("actions.edit")}
						onClick={() => onEdit(daily)}
						variant="ghost"
						size="icon"
					>
						<Edit className="w-3 h-3" />
					</Button>
				)}

				<Button
					size="sm"
					variant="ghost"
					onClick={() => setIsExpanded(!isExpanded)}
					className="border border-gray-200/50 dark:border-gray-600/50 p-0 w-7 h-7"
				>
					{isExpanded ? <ChevronDown className="w-3 h-3 rotate-180 transition-all duration-200" /> : <ChevronDown className="w-3 h-3 rotate-0 transition-all duration-200" />}
				</Button>
			</div>
			<CardHeader className="pb-0">
				<div className="pr-20 flex items-center gap-2">
					<RepeatIcon className={`w-4 h-4 flex-shrink-0 ${repeatConfig.color}`} />
					<CardTitle className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base break-words leading-snug">
						{daily.title}
					</CardTitle>
				</div>
			</CardHeader>

			<CardContent className="py-0">
				{/* Conteúdo expandido */}
				{isExpanded && (
					<div className="space-y-4 pt-4 border-gray-100 dark:border-gray-700 border-t max-w-full overflow-hidden">
						{/* Informações básicas */}
						<div className="space-y-3">
							<div className="font-medium text-gray-700 dark:text-gray-300 text-sm">
								Informações Básicas
							</div>
							<div className="pt-3">
								<Badge
									className="bg-indigo-50/80 dark:bg-indigo-900/30 border border-indigo-200/80 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 text-xs"
									title="Data de criação"
								>
									<Calendar className="w-3 h-3" />
									{new Date(daily.createdAt).toLocaleDateString('pt-BR')}
								</Badge>
							</div>
							<div className="flex flex-wrap items-center gap-2">
								<Badge className={`text-xs ${difficulty.color} dark:text-gray-300 truncate max-w-24`}>
									<span className="flex-shrink-0">{difficulty.stars}</span> <span className="truncate">{getDifficultyLabel(daily.difficulty)}</span>
								</Badge>
								<div className={`flex items-center gap-1 text-sm ${repeatConfig.color} dark:text-gray-300 min-w-0`}>
									<RepeatIcon className="flex-shrink-0 w-4 h-4" />
									<span className="truncate">{getRepeatLabel(daily.repeat?.type || "")}</span>
								</div>
							</div>
						</div>

						{/* Observações */}
						{daily.observations && (
							<div>
								<div className="mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
									Observações
								</div>
								<p className="max-h-16 overflow-hidden text-gray-600 dark:text-gray-400 break-words leading-relaxed">
									{daily.observations.length > 80
										? `${daily.observations.substring(0, 80)}...`
										: daily.observations
									}
								</p>
							</div>
						)}

						{/* Status do período */}
						{isCompleted && calculatedNextAvailableAt && (
							<div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
								<Clock className="flex-shrink-0 w-4 h-4" />
								<span className="break-words">{t("actions.availableIn")} {formatNextAvailable(calculatedNextAvailableAt)}</span>
							</div>
						)}

						{/* Próxima disponibilidade */}
						{!isCompleted && calculatedNextAvailableAt && (
							<div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm">
								<Clock className="flex-shrink-0 w-4 h-4" />
								<span className="break-words">Próxima: {calculatedNextAvailableAt.toLocaleDateString('pt-BR')}</span>
							</div>
						)}

						{/* Informações da repetição */}
						{daily.repeat && (
							<div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
								<RepeatIcon className="flex-shrink-0 w-4 h-4" />
								<span className="break-words">
									{daily.repeat.frequency > 1 ? `A cada ${daily.repeat.frequency} ` : ''}
									{getRepeatLabel(daily.repeat.type)}
								</span>
							</div>
						)}

						{/* Tags */}
						{daily.tags && daily.tags.length > 0 && (
							<div className="flex flex-wrap gap-1">
								{daily.tags.slice(0, 2).map((tag) => (
									<Badge
										key={tag}
										variant="secondary"
										className="bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-600 max-w-20 text-slate-700 dark:text-slate-300 text-xs truncate"
										title={tag}
									>
										<Tag className="flex-shrink-0 mr-1 w-3 h-3" />
										<span className="truncate">{tag}</span>
									</Badge>
								))}
								{daily.tags.length > 2 && (
									<Badge variant="outline" className="bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs">
										+{daily.tags.length - 2}
									</Badge>
								)}
							</div>
						)}
					</div>
				)}
			</CardContent>
			

		</Card>
	);
}
