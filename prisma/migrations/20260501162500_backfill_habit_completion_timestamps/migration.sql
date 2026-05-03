-- Backfill de timestamp UTC de conclusão para hábitos já concluídos.
UPDATE "habits" h
SET "lastCompletedAt" = logs."completedAt"
FROM (
	SELECT hl."habitId", MAX(hl."completedAt") AS "completedAt"
	FROM "habit_logs" hl
	GROUP BY hl."habitId"
) logs
WHERE h."id" = logs."habitId"
	AND h."lastCompletedDate" IS NOT NULL
	AND h."lastCompletedAt" IS NULL;

-- Normaliza a data local de conclusão no fuso de São Paulo.
UPDATE "habits"
SET "lastCompletedDate" = to_char(("lastCompletedAt" AT TIME ZONE 'America/Sao_Paulo')::date, 'YYYY-MM-DD')
WHERE "lastCompletedAt" IS NOT NULL;
