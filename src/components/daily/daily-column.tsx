import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Daily, DailyDifficulty } from "@/types/daily";
import { CalendarCheck, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useDailyContext } from "@/contexts/daily-context";
import { toast } from "sonner";
import { DailyCard } from "./daily-card";
import { DailyForm } from "./daily-form";

const defaultDaily: Daily = {
	id: "",
	userId: "",
	title: "",
	observations: "",
	difficulty: "Fácil" as DailyDifficulty,
	tags: [],
	repeat: { type: "Diariamente", frequency: 1 },
	startDate: new Date(),
	tasks: [],
	createdAt: new Date(),
};

interface DailyWithStatus {
	id: string;
	userId: string;
	title: string;
	observations: string;
	difficulty: string;
	repeatType: string;
	repeatFrequency: number;
	tags: string[];
	isAvailable: boolean;
	currentPeriod?: {
		id: string;
		startDate: Date;
		endDate: Date | null;
		isCompleted: boolean;
	};
	nextAvailableAt?: Date;
}

export const DailyColumn = () => {
	const { createDaily, deleteDaily } = useDailyContext();
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingDaily, setEditingDaily] = useState<Daily | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [dailyToDelete, setDailyToDelete] = useState<Daily | null>(null);

	// Estado com dados da API
	const [availableDailies, setAvailableDailies] = useState<DailyWithStatus[]>([]);
	const [completedDailies, setCompletedDailies] = useState<DailyWithStatus[]>([]);
	const [loading, setLoading] = useState(false);

	// Carregar dailies disponíveis
	const loadAvailableDailies = useCallback(async () => {
		setLoading(true);
		try {
			const response = await fetch('/api/dailies/available');

			if (response.ok) {
				const data = await response.json();

				// Garantir que os dados existem
				const availableDailies = Array.isArray(data.availableDailies) ? data.availableDailies : [];
				const completedToday = Array.isArray(data.completedToday) ? data.completedToday : [];

				// Só atualizar se recebeu dados válidos da API
				if (availableDailies.length > 0 || completedToday.length > 0) {
					setAvailableDailies(availableDailies);
					setCompletedDailies(completedToday);
				}
			}
		} catch (error) {
			console.error('Erro ao carregar dailies da API:', error);
			// Manter dados estáticos em caso de erro
		} finally {
			setLoading(false);
		}
	}, []);

	// Carregar ao montar o componente
	useEffect(() => {
		loadAvailableDailies();
	}, [loadAvailableDailies]);

	// Completar daily
	const handleCompleteDaily = useCallback(async (dailyId: string) => {
		try {
			const response = await fetch(`/api/dailies/${dailyId}/complete`, {
				method: 'POST',
			});

			if (response.ok) {
				const result = await response.json();
				toast.success(result.message);
				// Recarregar lista
				await loadAvailableDailies();
			} else {
				const error = await response.json();
				toast.error(error.error || 'Erro ao completar daily');
			}
		} catch (error) {
			toast.error('Erro ao completar daily. Tente novamente.');
			console.error('Erro ao completar daily:', error);
		}
	}, [loadAvailableDailies]);

	// Funções de controle do formulário
	const openEditForm = (daily: Daily) => {
		setEditingDaily(daily);
		setIsFormOpen(true);
	};

	const closeForm = () => {
		setIsFormOpen(false);
		setEditingDaily(null);
	};

	// Criar nova daily
	const handleCreateDaily = async (dailyData: Omit<Daily, "id" | "createdAt">) => {
		try {
			await createDaily(dailyData);
			toast.success(`Daily "${dailyData.title}" criada com sucesso!`);
			setIsFormOpen(false);
			// Recarregar lista
			await loadAvailableDailies();
		} catch (error) {
			toast.error("Erro ao criar daily. Tente novamente.");
			console.error("Erro ao criar daily:", error);
		}
	};

	// Editar daily existente
	const handleEditDaily = async (dailyData: Omit<Daily, "id" | "createdAt">) => {
		try {
			// TODO: Implementar updateDaily no contexto
			toast.success(`Daily "${dailyData.title}" atualizada com sucesso!`);
			setIsFormOpen(false);
			setEditingDaily(null);
			// Recarregar lista
			await loadAvailableDailies();
		} catch (error) {
			toast.error("Erro ao atualizar daily. Tente novamente.");
			console.error("Erro ao atualizar daily:", error);
		}
	};

	// Deletar daily
	// const handleDeleteDaily = (id: string) => {
	// 	const daily = availableDailies.find(d => d.id === id);
	// 	if (daily) {
	// 		setDailyToDelete({
	// 			id: daily.id,
	// 			userId: daily.userId,
	// 			title: daily.title,
	// 			observations: daily.observations,
	// 			difficulty: daily.difficulty as any,
	// 			repeat: { type: daily.repeatType as any, frequency: daily.repeatFrequency },
	// 			tags: daily.tags,
	// 			startDate: new Date(),
	// 			tasks: [],
	// 			createdAt: new Date(),
	// 		});
	// 		setIsDeleteDialogOpen(true);
	// 	}
	// };

	const confirmDeleteDaily = async () => {
		if (dailyToDelete) {
			try {
				// Chamar deleteDaily do contexto
				await deleteDaily(dailyToDelete.id);
				toast.success(`Daily "${dailyToDelete.title}" removida com sucesso!`);
				setIsDeleteDialogOpen(false);
				setDailyToDelete(null);
				// Recarregar lista
				await loadAvailableDailies();
			} catch (error) {
				toast.error("Erro ao remover daily. Tente novamente.");
				console.error("Erro ao remover daily:", error);
			}
		}
	};

	return (
		<div className="flex flex-col gap-4">
			<Card className="bg-gradient-to-r from-amber-50 to-blue-50 border-amber-200">
				<CardHeader className="pb-3">
					<div className="flex justify-between items-center">
						<div className="flex items-center gap-2">
							<CalendarCheck className="w-6 h-6 text-amber-600" />
							<CardTitle className="font-bold text-amber-900 text-xl">
								Diárias
							</CardTitle>
						</div>
						<Button
							onClick={() => setIsFormOpen(true)}
							size="sm"
							className="bg-amber-600 hover:bg-amber-700 text-white"
						>
							<Plus className="mr-1 w-4 h-4" />
							Nova Diária
						</Button>
					</div>
				</CardHeader>
				<CardContent className="pt-0">
					<div className="flex items-center gap-4 text-amber-700 text-sm">
						<div className="flex items-center gap-1">
							<span>{availableDailies.length} disponíveis</span>
						</div>
						{completedDailies.length > 0 && (
							<div className="flex items-center gap-1">
								<span>{completedDailies.length} completadas hoje</span>
							</div>
						)}
					</div>
				</CardContent>
			</Card>



			{/* Dailies Disponíveis */}
			{availableDailies.length > 0 && (
				<div className="space-y-4">
					<h3 className="font-semibold text-amber-800">Disponíveis</h3>
					{availableDailies.map((daily) => (
						<DailyCard
							key={daily.id}
							daily={{
								id: daily.id,
								userId: daily.userId,
								title: daily.title,
								observations: daily.observations,
								difficulty: daily.difficulty as any,
								repeat: { type: daily.repeatType as any, frequency: daily.repeatFrequency },
								tags: daily.tags,
								startDate: new Date(),
								tasks: [],
								createdAt: new Date(),
							}}
							onComplete={handleCompleteDaily}
							onEdit={openEditForm}
							isCompleted={false}
						/>
					))}
				</div>
			)}

			{/* Dailies Completadas Hoje */}
			{completedDailies.length > 0 && (
				<div className="space-y-4">
					<h3 className="font-semibold text-green-800">Completadas Hoje</h3>
					{completedDailies.map((daily) => (
						<DailyCard
							key={daily.id}
							daily={{
								id: daily.id,
								userId: daily.userId,
								title: daily.title,
								observations: daily.observations,
								difficulty: daily.difficulty as any,
								repeat: { type: daily.repeatType as any, frequency: daily.repeatFrequency },
								tags: daily.tags,
								startDate: new Date(),
								tasks: [],
								createdAt: new Date(),
							}}
							onComplete={handleCompleteDaily}
							isCompleted={true}
							nextAvailableAt={daily.nextAvailableAt}
						/>
					))}
				</div>
			)}

			{/* Estado vazio */}
			{availableDailies.length === 0 && completedDailies.length === 0 && (
				<Card className="bg-gray-50 border-gray-300 border-dashed">
					<CardContent className="py-8 text-center">
						<CalendarCheck className="mx-auto mb-3 w-12 h-12 text-gray-400" />
						<h3 className="mb-2 font-medium text-gray-600 text-lg">
							Nenhuma diária disponível
						</h3>
						<p className="mb-4 text-gray-500">
							Comece criando sua primeira diária para organizar sua rotina
						</p>
						<Button
							onClick={() => setIsFormOpen(true)}
							className="bg-amber-600 hover:bg-amber-700"
						>
							<Plus className="mr-2 w-4 h-4" />
							Criar Primeira Diária
						</Button>
					</CardContent>
				</Card>
			)}

			{/* Daily Form Modal */}
			<DailyForm
				daily={editingDaily || defaultDaily}
				onSubmit={editingDaily ? handleEditDaily : handleCreateDaily}
				onCancel={closeForm}
				open={isFormOpen}
			/>

			{/* Delete Confirmation Dialog */}
			<ConfirmationDialog
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
				onConfirm={confirmDeleteDaily}
				title="Remover Daily"
				description={`Tem certeza que deseja remover a daily "${dailyToDelete?.title}"? Esta ação não pode ser desfeita.`}
				confirmText="Remover"
				cancelText="Cancelar"
			/>
		</div >
	);
};
