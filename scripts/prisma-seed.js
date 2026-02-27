#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const isProduction = process.env.NODE_ENV === "production";
const shouldRunSeed =
	process.env.RUN_DB_SEED === "true" ||
	(!isProduction && process.env.SKIP_DB_SEED !== "true");

if (!shouldRunSeed) {
	console.log(
		"Skipping seed. Set RUN_DB_SEED=true to run seed during production build.",
	);
	process.exit(0);
}

const cmd = process.platform === "win32" ? "node.exe" : "node";
const result = spawnSync(cmd, ["scripts/seed-test-data.js"], {
	stdio: "inherit",
});

process.exit(result.status ?? 1);
