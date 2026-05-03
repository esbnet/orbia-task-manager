import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import pkg from "pg";

const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL;
const directConnectionString = process.env.DIRECT_DATABASE_URL || process.env.DIRECT_URL;
const isAccelerateEnabled = Boolean(connectionString?.startsWith("prisma://"));

function createPrismaClient() {
	if (isAccelerateEnabled && connectionString) {
		return new PrismaClient({
			accelerateUrl: connectionString,
		}).$extends(withAccelerate());
	}

	// Pool padrão para conexão direta; usa DIRECT_DATABASE_URL/DIRECT_URL se disponível.
	const pool = new Pool({
		connectionString: directConnectionString || connectionString,
		max: 10,
		idleTimeoutMillis: 30000,
		connectionTimeoutMillis: 5000,
	});

	const adapter = new PrismaPg(pool);

	return new PrismaClient({
		adapter,
	});
}

type PrismaInstance = PrismaClient;

declare global {
	var __prisma: PrismaInstance | undefined;
}

export const prisma =
	globalThis.__prisma || (createPrismaClient() as unknown as PrismaInstance);

if (process.env.NODE_ENV !== "production") {
	globalThis.__prisma = prisma;
}
