#!/usr/bin/env node

import { readdirSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

function runPrisma(args, { inherit = false } = {}) {
	const cmd = process.platform === "win32" ? "npx.cmd" : "npx";
	return spawnSync(cmd, ["prisma", ...args], {
		encoding: "utf8",
		stdio: inherit ? "inherit" : "pipe",
	});
}

function printResult(result) {
	if (result.stdout) process.stdout.write(result.stdout);
	if (result.stderr) process.stderr.write(result.stderr);
}

function getMigrationDirectories() {
	const migrationsRoot = path.join(process.cwd(), "prisma", "migrations");

	return readdirSync(migrationsRoot, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name)
		.sort();
}

function main() {
	const initial = runPrisma(["migrate", "deploy"]);
	const output = `${initial.stdout ?? ""}\n${initial.stderr ?? ""}`;

	if (initial.status === 0) {
		printResult(initial);
		process.exit(0);
	}

	if (!output.includes("P3005")) {
		printResult(initial);
		process.exit(initial.status ?? 1);
	}

	process.stderr.write(
		"Prisma migrate returned P3005. Running one-time baseline with migrate resolve...\n",
	);

	const migrations = getMigrationDirectories();
	for (const migration of migrations) {
		const resolved = runPrisma(["migrate", "resolve", "--applied", migration]);
		const resolveOutput = `${resolved.stdout ?? ""}\n${resolved.stderr ?? ""}`;

		if (resolved.status !== 0 && !resolveOutput.toLowerCase().includes("already")) {
			printResult(resolved);
			process.exit(resolved.status ?? 1);
		}

		printResult(resolved);
	}

	const deployAfterBaseline = runPrisma(["migrate", "deploy"], { inherit: true });
	process.exit(deployAfterBaseline.status ?? 1);
}

main();
