-- Backfill de timestamp UTC de conclusão para todos já concluídos.
UPDATE "todos" t
SET "lastCompletedAt" = logs."completedAt"
FROM (
	SELECT tl."todoId", MAX(tl."completedAt") AS "completedAt"
	FROM "todo_logs" tl
	GROUP BY tl."todoId"
) logs
WHERE t."id" = logs."todoId"
	AND t."lastCompletedDate" IS NOT NULL
	AND t."lastCompletedAt" IS NULL;

-- Normaliza a data local de conclusão com base no timestamp UTC no fuso de São Paulo.
UPDATE "todos"
SET "lastCompletedDate" = to_char(("lastCompletedAt" AT TIME ZONE 'America/Sao_Paulo')::date, 'YYYY-MM-DD')
WHERE "lastCompletedAt" IS NOT NULL;
