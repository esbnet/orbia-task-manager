import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Calendar,
	CheckCircle,
	ChevronDown,
	Clock,
	Edit,
	LoaderCircle,
	Tag
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useButtonLoading } from "@/hooks/use-button-loading";
import { useTranslation } from "@/hooks/use-translation";
import { useState } from "react";
import { toast } from "sonner";
import type { Daily } from "../../types";

interface DailyCardProps {
	daily: Daily;
	onEdit?: (daily: Daily) => void;
	onComplete?: (id: string) => Promise<void>;
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
	"Diariamente": { icon: Calendar, color: "text-blue-600 dark:text-blue-400" },
	"Semanalmente": { icon: Calendar, color: "text-green-600 dark:text-green-400" },
	"Mensalmente": { icon: Calendar, color: "text-purple-600 dark:text-purple-400" },
	"Anualmente": { icon: Calendar, color: "text-orange-600 dark:text-orange-400" },
};

export function DailyCard({
	daily,
	onEdit,
	onComplete,
	isCompleted = false,
	nextAvailableAt
}: DailyCardProps) {
	const completeLoading = useButtonLoading();
	const [isCompleting, setIsCompleting] = useState(false);
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
		if (isCompleting || completeLoading.isLoading) return;

		setIsCompleting(true);
		if (onComplete) {
			try {
				await completeLoading.executeAsync(
					async () => {
						await onComplete(daily.id);
						// Usar mensagem fixa para evitar problemas de tradução
						toast.success(`Tarefa "${daily.title}" concluída com sucesso!`);
					},
					undefined,
					() => toast.error("Erro ao completar tarefa. Tente novamente.")
				);
			} finally {
				setIsCompleting(false);
			}
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

		const now = new Date();
		const { type, frequency } = daily.repeat;

		switch (type) {
			case "Diariamente":
				const tomorrow = new Date(now);
				tomorrow.setDate(now.getDate() + frequency);
				tomorrow.setHours(0, 0, 0, 0);
				return tomorrow;
			case "Semanalmente":
				const nextWeek = new Date(now);
				nextWeek.setDate(now.getDate() + (7 * frequency));
				return nextWeek;
			case "Mensalmente":
				const nextMonth = new Date(now);
				nextMonth.setMonth(now.getMonth() + frequency);
				return nextMonth;
			case "Anualmente":
				const nextYear = new Date(now);
				nextYear.setFullYear(now.getFullYear() + frequency);
				return nextYear;
			default:
				return null;
		}
	};

	const calculatedNextAvailableAt = calculateNextAvailableDate();

	return (
		<Card className={`hover:shadow-md transition-shadow duration-200 ${(completeLoading.isLoading || isCompleting) ? "opacity-50 pointer-events-none" : ""}`}>
			<CardHeader className="">
				<div className="flex justify-between items-start gap-3">
					<div className="flex-1 min-w-0">
						<CardTitle className="pr-2 font-semibold text-gray-900 dark:text-gray-100 text-lg leading-tight">
							{daily.title}
						</CardTitle>
					</div>

					<div className="flex flex-shrink-0 items-center gap-1">
						{!isCompleted && (
							<Button
								className="hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-full w-8 h-8 text-amber-600 hover:text-orange-600"
								title={t("actions.complete")}
								onClick={handleComplete}
								size="icon"
								variant="ghost"
								disabled={completeLoading.isLoading || isCompleting}
							>
								{(completeLoading.isLoading || isCompleting) ? (
									<LoaderCircle className="w-4 h-4 text-amber-600 animate-spin" />
								) : (
									<CheckCircle className="w-4 h-4" />
								)}
							</Button>
						)}

						{onEdit && (
							<Button
								className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full w-8 h-8 text-gray-600 dark:text-gray-400"
								title={t("actions.edit")}
								onClick={() => onEdit(daily)}
								variant="ghost"
								size="icon"
							>
								<Edit className="w-4 h-4" />
							</Button>
						)}

						{/* Botão para expandir/ocultar detalhes */}
						<Button
							size="sm"
							variant="ghost"
							onClick={() => setIsExpanded(!isExpanded)}
							className="flex-shrink-0 p-0 w-8 h-8"
						>
							{isExpanded ? <ChevronDown className="rotate-180 transition-all duration-200" /> : <ChevronDown className="rotate-0 transition-all duration-200" />}
						</Button>
					</div>
				</div>
			</CardHeader>

			<CardContent className="pt-0">

				{/* Conteúdo expandido */}
				{isExpanded && (
					<div className="space-y-4 mt-4 pt-4 border-gray-100 dark:border-gray-700 border-t">
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

								<Badge className={`text-xs ${difficulty.color} dark:text-gray-300`}>
									{difficulty.stars} {getDifficultyLabel(daily.difficulty)}
								</Badge>
								<div className={`flex items-center gap-1 text-sm ${repeatConfig.color} dark:text-gray-300`}>
									<RepeatIcon className="w-4 h-4" />
									<span>{getRepeatLabel(daily.repeat?.type || "")}</span>
								</div>
							</div>
						</div>

						{/* Observações */}
						{daily.observations && (
							<div>
								<div className="mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
									Observações
								</div>
								<p className="text-gray-600 dark:text-gray-400 leading-relaxed">
									{daily.observations}
								</p>
							</div>
						)}

						{/* Status do período */}
						{isCompleted && calculatedNextAvailableAt && (
							<div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
								<Clock className="w-4 h-4" />
								<span>{t("actions.availableIn")} {formatNextAvailable(calculatedNextAvailableAt)}</span>
							</div>
						)}

						{/* Próxima disponibilidade */}
						{!isCompleted && calculatedNextAvailableAt && (
							<div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm">
								<Clock className="w-4 h-4" />
								<span>Próxima: {calculatedNextAvailableAt.toLocaleDateString('pt-BR')}</span>
							</div>
						)}

						{/* Informações da repetição */}
						{daily.repeat && (
							<div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
								<RepeatIcon className="w-4 h-4" />
								<span>
									{daily.repeat.frequency > 1 ? `A cada ${daily.repeat.frequency} ` : ''}
									{getRepeatLabel(daily.repeat.type)}
								</span>
							</div>
						)}

						{/* Tags */}
						{daily.tags && daily.tags.length > 0 && (
							<div className="flex flex-wrap gap-1">
								{daily.tags.slice(0, 3).map((tag) => (
									<Badge
										key={tag}
										variant="secondary"
										className="bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs"
									>
										<Tag className="mr-1 w-3 h-3" />
										{tag}
									</Badge>
								))}
								{daily.tags.length > 3 && (
									<Badge variant="outline" className="bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs">
										+{daily.tags.length - 3}
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
