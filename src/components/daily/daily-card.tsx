import {
	Calendar,
	CheckCircle,
	Clock,
	Edit,
	LoaderCircle,
	Tag
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Daily } from "../../types";
import { toast } from "sonner";
import { useButtonLoading } from "@/hooks/use-button-loading";
import { useState } from "react";
import { useTranslation } from "@/hooks/use-translation";

interface DailyCardProps {
	daily: Daily;
	onEdit?: (daily: Daily) => void;
	onComplete?: (id: string) => Promise<void>;
	isCompleted?: boolean;
	nextAvailableAt?: Date | string;
}

const difficultyConfig = {
	"Trivial": { color: "bg-gray-100 text-gray-800", stars: "⭐" },
	"Fácil": { color: "bg-green-100 text-green-800", stars: "⭐⭐" },
	"Médio": { color: "bg-yellow-100 text-yellow-800", stars: "⭐⭐⭐" },
	"Difícil": { color: "bg-red-100 text-red-800", stars: "⭐⭐⭐⭐" },
};

const repeatTypeConfig = {
	"Diariamente": { icon: Calendar, color: "text-blue-600" },
	"Semanalmente": { icon: Calendar, color: "text-green-600" },
	"Mensalmente": { icon: Calendar, color: "text-purple-600" },
	"Anualmente": { icon: Calendar, color: "text-orange-600" },
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
			<CardHeader className="pb-3">
				<div className="flex justify-between items-start">
					<div className="flex-1">
						<div className="flex justify-between items-center gap-2 mb-2">
							<h3 className="font-semibold line-clamp-1">
								{daily.title}
							</h3>
							{isCompleted ? (
								<CheckCircle className="w-5 h-5 text-green-600" />
							) : (
								<div className="flex items-center">
									{!isCompleted && (
										<Button
											className="hover:bg-amber-100 rounded-full text-amber-600 hover:text-orange-600"
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
											className="hover:bg-gray-100 rounded-full text-gray-600"
											title={t("actions.edit")}
											onClick={() => onEdit(daily)}
											variant="ghost"
											size="icon"
										>
											<Edit className="w-4 h-4" />
										</Button>
									)}
								</div>
							)}
						</div>

						<div className="flex items-center gap-2 mb-2">
							<Badge className={`text-xs ${difficulty.color}`}>
								{difficulty.stars} {getDifficultyLabel(daily.difficulty)}
							</Badge>
							<div className={`flex items-center gap-1 text-sm ${repeatConfig.color}`}>
								<RepeatIcon className="w-4 h-4" />
								<span>{getRepeatLabel(daily.repeat?.type || "")}</span>
							</div>
						</div>

						{daily.observations && (
							<p className="mb-2 text-gray-600 text-sm line-clamp-2">
								{daily.observations}
							</p>
						)}

						{/* Status do período */}
						{isCompleted && calculatedNextAvailableAt && (
							<div className="flex items-center gap-1 text-gray-500 text-sm">
								<Clock className="w-4 h-4" />
								<span>{t("actions.availableIn")} {formatNextAvailable(calculatedNextAvailableAt)}</span>
							</div>
						)}

						{/* Mostrar próxima disponibilidade mesmo quando não completada */}
						{!isCompleted && calculatedNextAvailableAt && (
							<div className="flex items-center gap-1 text-blue-600 text-sm">
								<Clock className="w-4 h-4" />
								<span>Próxima: {calculatedNextAvailableAt.toLocaleDateString('pt-BR')}</span>
							</div>
						)}

						{/* Mostrar informações da repetição */}
						{daily.repeat && (
							<div className="flex items-center gap-1 text-gray-500 text-xs">
								<RepeatIcon className="w-3 h-3" />
								<span>
									{daily.repeat.frequency > 1 ? `A cada ${daily.repeat.frequency} ` : ''}
									{getRepeatLabel(daily.repeat.type)}
								</span>
							</div>
						)}

					</div>
				</div>
			</CardHeader>

			<CardContent className="pt-0">
				<div className="flex justify-between items-center">
					<div className="flex items-center gap-2">
						{daily.tags && daily.tags.length > 0 && (
							<div className="flex gap-1">
								{daily.tags.slice(0, 2).map((tag) => (
									<Badge
										key={tag}
										variant="secondary"
										className="text-xs"
									>
										<Tag className="mr-1 w-3 h-3" />
										{tag}
									</Badge>
								))}
								{daily.tags.length > 2 && (
									<Badge variant="outline" className="text-xs">
										+{daily.tags.length - 2}
									</Badge>
								)}
							</div>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
