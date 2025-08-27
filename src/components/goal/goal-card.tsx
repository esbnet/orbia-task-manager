"use client";

import {
	AlertTriangle,
	Calendar,
	CheckCircle,
	Edit,
	Tag,
	Target,
	XCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Goal } from "@/domain/entities/goal";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

interface GoalCardProps {
	goal: Goal;
	onDelete?: (goalId: string) => void;
	onEdit?: (goal: Goal) => void;
	onStatusChange?: (goalId: string, status: Goal["status"]) => void;
}

const priorityColors = {
	LOW: "bg-green-100 text-green-800",
	MEDIUM: "bg-yellow-100 text-yellow-800",
	HIGH: "bg-orange-100 text-orange-800",
	URGENT: "bg-red-100 text-red-800",
};

const statusColors = {
	IN_PROGRESS: "bg-blue-100 text-blue-800",
	COMPLETED: "bg-green-100 text-green-800",
	CANCELLED: "bg-gray-100 text-gray-800",
};

const categoryIcons = {
	PERSONAL: Target,
	WORK: Target,
	HEALTH: Target,
	LEARNING: Target,
};

export function GoalCard({
	goal,
	onEdit,
	onStatusChange,
}: GoalCardProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const isOverdue =
		goal.status === "IN_PROGRESS" && new Date(goal.targetDate) < new Date();
	const daysUntilTarget = Math.ceil(
		(new Date(goal.targetDate).getTime() - new Date().getTime()) /
		(1000 * 60 * 60 * 24),
	);

	const CategoryIcon = categoryIcons[goal.category];

	const handleStatusChange = (newStatus: Goal["status"]) => {
		onStatusChange?.(goal.id, newStatus);
	};

	return (
		<Card
			className={`transition-all duration-200 hover:shadow-lg ${isOverdue ? "border-red-300 bg-red-50" : ""
				}`}
		>
			<CardHeader className="pb-3">
				<div className="flex justify-between items-start">
					<div className="flex-1">
						<CardTitle className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
							{goal.title}
						</CardTitle>
						<div className="flex items-center gap-2 mt-2">
							<CategoryIcon className="w-4 h-4 text-gray-500" />
							<Badge
								variant="outline"
								className={priorityColors[goal.priority]}
							>
								{goal.priority === "HIGH" && "Alta"}
								{goal.priority === "MEDIUM" && "Média"}
								{goal.priority === "LOW" && "Baixa"}
								{goal.priority === "URGENT" && "Urgente"}
							</Badge>
							<Badge
								variant="outline"
								className={statusColors[goal.status]}
							>
								{goal.status === "IN_PROGRESS" && "Em andamento"}
								{goal.status === "COMPLETED" && "Concluído"}
								{goal.status === "CANCELLED" && "Cancelado"}
							</Badge>
						</div>
					</div>
					<div className="flex items-center gap-2">
						{goal.status === "IN_PROGRESS" && (
							<>
								<Button
									title="Concluído"
									size="sm"
									variant="outline"
									onClick={() =>
										handleStatusChange("COMPLETED")
									}
									className="hover:bg-green-50 border-green-200 text-green-600"
								>
									<CheckCircle className="w-4 h-4" />
								</Button>
								<Button
									title="Cancelar"
									size="sm"
									variant="outline"
									onClick={() =>
										handleStatusChange("CANCELLED")
									}
									className="hover:bg-gray-50 border-gray-200 text-gray-600"
								>
									<XCircle className="w-4 h-4" />
								</Button>
							</>
						)}
						{onEdit && (
							<Button
								title="Editar"
								size="sm"
								variant="outline"
								onClick={() => onEdit(goal)}
							>
								<Edit className="w-4 h-4" />
							</Button>
						)}

					</div>
				</div>
			</CardHeader>

			<CardContent className="pt-0">
				{goal.description && (
					<p className="mb-3 text-gray-600 dark:text-gray-400">
						{goal.description}
					</p>
				)}

				<div className="flex items-center gap-2 mb-3 text-gray-500 text-sm">
					<Calendar className="w-4 h-4" />
					<span>
						Meta:{" "}
						{format(new Date(goal.targetDate), "dd 'de' MMMM 'de' yyyy", {
							locale: ptBR,
						})}
					</span>
					{isOverdue && (
						<AlertTriangle className="w-4 h-4 text-red-500" />
					)}
				</div>

				{goal.status === "IN_PROGRESS" && (
					<div className="text-gray-600 dark:text-gray-400 text-sm">
						{isOverdue ? (
							<span className="font-medium text-red-600">
								Atrasado há {Math.abs(daysUntilTarget)} dias
							</span>
						) : daysUntilTarget > 0 ? (
							<span className="text-blue-600">
								Faltam {daysUntilTarget} dias
							</span>
						) : (
							<span className="font-medium text-orange-600">
								Vence hoje!
							</span>
						)}
					</div>
				)}

				{goal.tags.length > 0 && (
					<div className="flex flex-wrap gap-1 mt-3">
						{goal.tags.map((tag) => (
							<Badge
								key={tag}
								variant="secondary"
								className="text-xs"
							>
								<Tag className="mr-1 w-3 h-3" />
								{tag}
							</Badge>
						))}
					</div>
				)}

				<div className="flex justify-between items-center mt-4 pt-3 border-gray-100 border-t">
					<div className="text-gray-500 text-xs">
						Criado em{" "}
						{format(goal.createdAt, "dd/MM/yyyy", { locale: ptBR })}
					</div>
					<Button
						size="sm"
						variant="ghost"
						onClick={() => setIsExpanded(!isExpanded)}
					>
						{isExpanded ? "Ver menos" : "Ver mais"}
					</Button>
				</div>

				{isExpanded && (
					<div className="mt-3 pt-3 border-gray-100 border-t">
						<div className="text-gray-600 dark:text-gray-400 text-sm">
							<strong>Última atualização:</strong>{" "}
							{format(goal.updatedAt, "dd/MM/yyyy 'às' HH:mm", {
								locale: ptBR,
							})}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
