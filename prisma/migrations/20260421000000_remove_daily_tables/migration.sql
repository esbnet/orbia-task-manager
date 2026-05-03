-- Drop Daily-related tables and enums
-- This migration removes the Daily category from the system.
-- Todo (with recurrence) now covers this functionality.

-- Drop foreign key dependent tables first
DROP TABLE IF EXISTS "daily_logs" CASCADE;
DROP TABLE IF EXISTS "daily_subtasks" CASCADE;
DROP TABLE IF EXISTS "daily_periods" CASCADE;
DROP TABLE IF EXISTS "dailies" CASCADE;
