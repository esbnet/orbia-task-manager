import { defineConfig } from "@prisma/config";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

function readEnvFile(): Record<string, string> {
	const envPath = path.join(process.cwd(), ".env");
	if (!existsSync(envPath)) return {};

	const data = readFileSync(envPath, "utf8");
	const result: Record<string, string> = {};

	for (const rawLine of data.split("\n")) {
		const line = rawLine.trim();
		if (!line || line.startsWith("#")) continue;

		const eqIndex = line.indexOf("=");
		if (eqIndex <= 0) continue;

		const key = line.slice(0, eqIndex).trim();
		const value = line
			.slice(eqIndex + 1)
			.trim()
			.replace(/^["']|["']$/g, "");

		if (key) result[key] = value;
	}

	return result;
}

const envFromFile = readEnvFile();

function firstNonEmpty(...keys: string[]): string | undefined {
	for (const key of keys) {
		const value = process.env[key] ?? envFromFile[key];
		if (value && value.trim().length > 0) return value;
	}
	return undefined;
}

const isProduction = process.env.NODE_ENV === "production";

const databaseUrl = isProduction
	? firstNonEmpty("PROD_DATABASE_URL", "DATABASE_URL", "DEV_DATABASE_URL")
	: firstNonEmpty("DATABASE_URL", "DEV_DATABASE_URL", "PROD_DATABASE_URL");

const shadowDatabaseUrl = isProduction
	? firstNonEmpty("PROD_DIRECT_URL", "DIRECT_URL", "DEV_DIRECT_URL")
	: firstNonEmpty("DIRECT_URL", "DEV_DIRECT_URL", "PROD_DIRECT_URL");

export default defineConfig({
	schema: "./prisma/schema.prisma",
	migrations: {
		seed: "node scripts/seed-test-data.js",
	},
	datasource: {
		url: databaseUrl,
		shadowDatabaseUrl,
	},
});
