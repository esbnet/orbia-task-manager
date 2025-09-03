import {
	Calendar,
	CheckCircle,
	Clock,
	Edit,
	Tag
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Daily } from "../../types";
import { toast } from "sonner";
import { useButtonLoading } from "@/hooks/use-button-loading";

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
	const difficulty = difficultyConfig[daily.difficulty as keyof typeof difficultyConfig] || difficultyConfig["Fácil"];
	const repeatConfig = repeatTypeConfig[daily.repeat?.type as keyof typeof repeatTypeConfig] || repeatTypeConfig["Diariamente"];
	const RepeatIcon = repeatConfig.icon;

	const handleComplete = async () => {
		if (onComplete) {
			await completeLoading.executeAsync(
				async () => {
					await onComplete(daily.id);
					toast.success(`Daily "${daily.title}" completada!`);
				},
				undefined,
				() => toast.error("Erro ao completar daily. Tente novamente.")
			);
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

	return (
		<Card className="hover:shadow-md transition-shadow duration-200">
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
								<div className="flex items-center gap-1">
									{!isCompleted && (
										<Button
											title="Concluir"
											onClick={handleComplete}
											size="sm"
											variant="ghost"
											className="hover:bg-amber-200 text-amber-600"
											disabled={completeLoading.isLoading}
										>
											{completeLoading.isLoading ? (
												<div className="border-2 border-amber-600 border-t-transparent rounded-full w-4 h-4 animate-spin" />
											) : (
												<CheckCircle className="mr-1 w-4 h-4" />
											)}
										</Button>
									)}

									{onEdit && (
										<Button
											title="Editar"
											className="hover:bg-gray-200 text-gray-600"

											onClick={() => onEdit(daily)}
											variant="ghost"
											size="sm"
										>
											<Edit className="w-4 h-4" />
										</Button>
									)}
								</div>
							)}
						</div>

						<div className="flex items-center gap-2 mb-2">
							<Badge className={`text-xs ${difficulty.color}`}>
								{difficulty.stars} {daily.difficulty}
							</Badge>
							<div className={`flex items-center gap-1 text-sm ${repeatConfig.color}`}>
								<RepeatIcon className="w-4 h-4" />
								<span>{daily.repeat?.type}</span>
							</div>
						</div>

						{daily.observations && (
							<p className="mb-2 text-gray-600 text-sm line-clamp-2">
								{daily.observations}
							</p>
						)}

						{/* Status do período */}
						{isCompleted && nextAvailableAt && (
							<div className="flex items-center gap-1 text-gray-500 text-sm">
								<Clock className="w-4 h-4" />
								<span>Disponível em {formatNextAvailable(nextAvailableAt)}</span>
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
