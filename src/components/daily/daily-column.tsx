import { CalendarCheck, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Daily, DailyDifficulty } from "@/types/daily";
import { useAvailableDailies, useCompleteDaily, useCreateDaily, useDeleteDaily, useUpdateDaily } from "@/hooks/use-dailies";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { DailyCard } from "./daily-card";
import { DailyForm } from "./daily-form";
import { toast } from "sonner";

const defaultDaily: Daily = {
	id: "",
	userId: "",
	title: "",
	observations: "",
	tasks: [],
	difficulty: "Fácil" as DailyDifficulty,
	startDate: new Date(),
	repeat: { type: "Diariamente", frequency: 1 },
	tags: [],
	createdAt: new Date(),
};

export const DailyColumn = () => {
	const createDailyMutation = useCreateDaily();
	const updateDailyMutation = useUpdateDaily();
	const deleteDailyMutation = useDeleteDaily();
	const { data: dailiesData, isLoading } = useAvailableDailies();

	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingDaily, setEditingDaily] = useState<Daily | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [dailyToDelete, setDailyToDelete] = useState<Daily | null>(null);


	// Usar dados do React Query
	const availableDailies = dailiesData?.availableDailies || [];
	const completedDailies = dailiesData?.completedToday || [];

	// Completar daily - usando React Query
	const { mutateAsync: completeDailyMutation } = useCompleteDaily();

	const handleCompleteDaily = useCallback(async (dailyId: string) => {
		try {
			await completeDailyMutation(dailyId);
		} catch (error) {
			toast.error('Erro ao completar daily. Tente novamente.');
		}
	}, [completeDailyMutation]);

	// Funções de controle do formulário
	const openEditForm = async (daily: Daily) => {
		// Se for um daily mock, usar os dados diretamente
		if (daily.id.startsWith('mock-')) {
			setEditingDaily(daily);
			setIsFormOpen(true);
			return;
		}

		try {
			// Buscar dados completos da daily para edição
			const response = await fetch(`/api/daily/${daily.id}`);
			if (response.ok) {
				const data = await response.json();
				setEditingDaily(data.daily);
				setIsFormOpen(true);
			} else {
				toast.error('Erro ao carregar dados da diária. Tente novamente.');
			}
		} catch (error) {
			toast.error('Erro ao carregar dados da diária. Tente novamente.');
		}
	};

	const closeForm = () => {
		setIsFormOpen(false);
		setEditingDaily(null);
	};

	// Criar nova daily
	const handleCreateDaily = async (dailyData: Omit<Daily, "id" | "createdAt">) => {
		try {
			await createDailyMutation.mutateAsync(dailyData);
			setIsFormOpen(false);
		} catch (error) {
			toast.error("Erro ao criar daily. Tente novamente.");
		}
	};

	// Editar daily existente
	const handleEditDaily = async (dailyData: Omit<Daily, "id" | "createdAt">) => {
		if (!editingDaily) {
			console.log('handleEditDaily: Nenhum daily sendo editado');
			return;
		}

		try {
			// Se for um daily mock, criar um novo daily real
			if (editingDaily.id.startsWith('mock-')) {
				const result = await createDailyMutation.mutateAsync(dailyData);
				toast.success(`Daily "${dailyData.title}" criada com sucesso!`);
			} else {
				// Para dailies reais, atualizar normalmente
				await updateDailyMutation.mutateAsync({
					id: editingDaily.id,
					data: {
						...editingDaily,
						...dailyData,
					}
				});
			}

			// console.log('handleEditDaily: Fechando formulário');
			setIsFormOpen(false);
			setEditingDaily(null);
		} catch (error) {
			toast.error("Erro ao salvar daily. Tente novamente.");
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
				// Chamar deleteDaily do React Query
				await deleteDailyMutation.mutateAsync(dailyToDelete.id);
				toast.success(`Daily "${dailyToDelete.title}" removida com sucesso!`);
				setIsDeleteDialogOpen(false);
				setDailyToDelete(null);
				// A lista será automaticamente atualizada pelo React Query
			} catch (error) {
				toast.error("Erro ao remover daily. Tente novamente.");
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
					{availableDailies.map((daily: Daily) => (
						<DailyCard
							key={daily.id}
							daily={{
								id: daily.id,
								userId: daily.userId,
								title: daily.title,
								observations: daily.observations,
								difficulty: daily.difficulty as "Fácil",
								repeat: {
									type: (daily as any).repeatType as 'Diariamente',
									frequency: (daily as any).repeatFrequency
								},
								tags: daily.tags,
								startDate: new Date(),
								tasks: daily.tasks || [],
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
					{completedDailies.map((daily: Daily) => (
						<DailyCard
							key={daily.id}
							daily={{
								id: daily.id,
								userId: daily.userId,
								title: daily.title,
								observations: daily.observations,
								difficulty: daily.difficulty as "Fácil",
								repeat: {
									type: (daily as any).repeatType as 'Diariamente',
									frequency: (daily as any).repeatFrequency
								},
								tags: daily.tags,
								startDate: new Date(),
								tasks: daily.tasks || [],
								createdAt: new Date(),
							}}
							onComplete={handleCompleteDaily}
							isCompleted={true}
							nextAvailableAt={undefined}
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
