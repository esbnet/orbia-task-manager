-- Add home layout preference to user configuration.
ALTER TABLE "user_configs"
ADD COLUMN "homeLayout" TEXT NOT NULL DEFAULT 'default';
