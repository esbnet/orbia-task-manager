import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";

const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL;
const directConnectionString = process.env.DIRECT_URL;

// Pool padrão; usa DIRECT_URL se disponível (útil para migrações/admin)
const pool = new Pool({
	connectionString: directConnectionString || connectionString,
});

const adapter = new PrismaPg(pool);

declare global {
	var __prisma: PrismaClient | undefined;
}

export const prisma = globalThis.__prisma || new PrismaClient({
	adapter,
});

if (process.env.NODE_ENV !== "production") {
	globalThis.__prisma = prisma;
}
