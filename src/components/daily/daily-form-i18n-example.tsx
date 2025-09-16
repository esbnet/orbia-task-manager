// Exemplo de como atualizar o DailyForm para usar i18n
// Este é um exemplo parcial mostrando as principais mudanças necessárias

"use client";

import { useTranslation } from "@/hooks/use-translation";
// ... outros imports

export function DailyForm({ daily, onSubmit, onCancel, open = false }: DailyFormProps) {
    const { t } = useTranslation();
    // ... resto do código

    // Exemplo de como usar as traduções nos elementos do formulário:
    
    return (
        <>
            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogContent className="flex flex-col gap-4 shadow-xl backdrop-blur-sm backdrop-opacity-0">
                    <DialogHeader className="flex flex-col gap-1">
                        <DialogTitle>{t("forms.editDaily")}</DialogTitle>
                        <DialogDescription className="text-zinc-400 text-sm">
                            {t("forms.editDetails")}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleUpdateDaily} className="flex flex-col gap-4 bg-gray-100/20 p-2 rounded-lg animate-[fadeIn_1s_ease-in-out_forwards]">
                        {/* Título */}
                        <div className="flex flex-col gap-1">
                            <Label>{t("forms.title")}</Label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder={t("forms.newDaily")}
                                required
                            />
                        </div>

                        {/* Observações */}
                        <div className="flex flex-col gap-1">
                            <Label>{t("forms.observations")}</Label>
                            <Input
                                value={observations}
                                onChange={(e) => setObservations(e.target.value)}
                                placeholder={t("forms.addObservations")}
                            />
                        </div>

                        {/* Lista de tarefas */}
                        <div className="flex flex-col gap-1">
                            <Label>{t("forms.taskList")}</Label>
                            <DailySubtaskList
                                dailyId={daily.id}
                                initialSubtasks={daily.subtasks || []}
                            />
                        </div>

                        {/* Dificuldade */}
                        <div className="flex flex-col gap-1">
                            <Label>{t("forms.difficulty")}</Label>
                            <Select
                                onValueChange={(value) => setDifficulty(value as DailyDifficulty)}
                                value={difficulty || "Fácil"}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue
                                        placeholder={t("forms.difficulty")}
                                        className="text-zinc-300"
                                    />
                                </SelectTrigger>
                                <SelectContent className="w-full" defaultValue={difficulty}>
                                    <SelectItem value="Trivial">
                                        {t("difficulty.trivial")} ⭐
                                    </SelectItem>
                                    <SelectItem value="Fácil">
                                        {t("difficulty.easy")} ⭐⭐
                                    </SelectItem>
                                    <SelectItem value="Média">
                                        {t("difficulty.medium")} ⭐⭐⭐
                                    </SelectItem>
                                    <SelectItem value="Difícil">
                                        {t("difficulty.hard")} ⭐⭐⭐⭐
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Data de início */}
                        <div className="flex flex-col gap-1">
                            <Label>{t("forms.startDate")}</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        data-empty={!startDate}
                                        className="justify-start w-[280px] font-normal data-[empty=true]:text-muted-foreground text-left"
                                    >
                                        <CalendarIcon />
                                        {startDate ? (
                                            format(startDate, "PPP", { locale: ptBR })
                                        ) : (
                                            <span>{t("common.pickDate")}</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0 w-auto">
                                    <Calendar
                                        mode="single"
                                        required={true}
                                        selected={startDate}
                                        onSelect={setStartDate}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Repetição */}
                        <div className="flex flex-col gap-1">
                            <Label>{t("forms.repeat")}</Label>
                            <Select
                                onValueChange={(value) => setRepeatType(value as DailyRepeatType)}
                                value={repeatType || "Semanalmente"}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue
                                        placeholder={t("forms.repeat")}
                                        className="text-zinc-300"
                                    />
                                </SelectTrigger>
                                <SelectContent className="w-[180px]" defaultValue={repeatType}>
                                    <SelectItem value="Diariamente">
                                        {t("repeat.daily")}
                                    </SelectItem>
                                    <SelectItem value="Semanalmente">
                                        {t("repeat.weekly")}
                                    </SelectItem>
                                    <SelectItem value="Mensalmente">
                                        {t("repeat.monthly")}
                                    </SelectItem>
                                    <SelectItem value="Anualmente">
                                        {t("repeat.yearly")}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* A cada */}
                        <div className="flex flex-col gap-1">
                            <Label>{t("forms.every")}</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    value={repeatFrequency || 1}
                                    onChange={(e) =>
                                        setRepeatFrequency(
                                            e.target.value ? Number.parseInt(e.target.value) : 1
                                        )
                                    }
                                    placeholder="Quantidade de vezes"
                                    required
                                />
                                <span>
                                    {repeatType === "Diariamente"
                                        ? t("repeat.day")
                                        : repeatType === "Semanalmente"
                                        ? t("repeat.week")
                                        : repeatType === "Mensalmente"
                                        ? t("repeat.month")
                                        : repeatType === "Anualmente"
                                        ? t("repeat.year")
                                        : ""}
                                </span>
                            </div>
                        </div>

                        {/* Etiquetas */}
                        <div className="flex flex-col gap-1">
                            <Label>{t("forms.tags")}</Label>
                            <MultiSelect
                                key={`tags-${tagOptions.length}`}
                                id="tags"
                                options={tagOptions}
                                onValueChange={(value) => setTags(value)}
                                defaultValue={tags || []}
                                placeholder={t("forms.addTags")}
                                variant="inverted"
                                maxCount={3}
                            />
                        </div>

                        {/* Botões */}
                        <div className="flex justify-end gap-1 mt-2">
                            <DialogClose asChild>
                                <Button variant="link">{t("common.cancel")}</Button>
                            </DialogClose>
                            <Button
                                type="submit"
                                className="flex-1"
                                disabled={isLoading}
                            >
                                <SaveIcon />
                                {isLoading ? t("common.saving") : t("common.save")}
                            </Button>
                        </div>
                    </form>

                    <div className="flex justify-right items-center">
                        <DialogConfirmDelete id={daily.id} />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

function DialogConfirmDelete({ id }: { id: string }) {
    const { t } = useTranslation();
    const { deleteDaily } = useDailyContext();
    const [isDeleting, setIsDeleting] = useState(false);

    const onDelete = async () => {
        if (isDeleting) return;
        setIsDeleting(true);
        try {
            await deleteDaily(id);
            toast.success(t("messages.taskDeleted"));
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="flex justify-center items-center mt-4 w-full">
                    <Button
                        variant="link"
                        className="flex justify-center items-center hover:bg-background/20 rounded-lg text-destructive cursor-pointer"
                    >
                        <Trash2 size={16} /> {t("delete.deleteTask")}
                    </Button>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t("common.areYouSure")}</DialogTitle>
                    <DialogDescription>
                        {t("common.cannotUndo")}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        type="submit"
                        variant="destructive"
                        onClick={onDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? t("common.deleting") : t("common.delete")}
                    </Button>
                    <DialogClose asChild>
                        <Button variant="outline">{t("common.cancel")}</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}