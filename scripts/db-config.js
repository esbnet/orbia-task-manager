#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const environment = process.argv[2] || 'development';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../.env');

// Carregar variáveis de ambiente manualmente
function loadEnvVars() {
	try {
		const envContent = fs.readFileSync(envPath, 'utf8');
		const envVars = {};
		
		envContent.split('\n').forEach(line => {
			const trimmed = line.trim();
			if (trimmed && !trimmed.startsWith('#')) {
				const [key, ...valueParts] = trimmed.split('=');
				if (key && valueParts.length > 0) {
					const value = valueParts.join('=').replace(/^["']|["']$/g, '');
					envVars[key] = value;
				}
			}
		});
		
		return envVars;
	} catch (error) {
		console.error('❌ Erro ao carregar .env:', error.message);
		return {};
	}
}

const envVars = loadEnvVars();

// Usar variáveis do sistema se .env não existir (produção)
const devDatabaseUrl = envVars.DEV_DATABASE_URL || process.env.DEV_DATABASE_URL;
const devDirectUrl = envVars.DEV_DIRECT_URL || process.env.DEV_DIRECT_URL;
const prodDatabaseUrl = envVars.PROD_DATABASE_URL || process.env.DATABASE_URL;
const prodDirectUrl = envVars.PROD_DIRECT_URL || process.env.DIRECT_URL;

if (environment === 'development' && (!devDatabaseUrl || !devDirectUrl)) {
	console.error('❌ Variáveis de desenvolvimento não encontradas');
	console.error('Certifique-se de que DEV_DATABASE_URL e DEV_DIRECT_URL estão definidas');
	process.exit(1);
}

if (environment === 'production' && (!prodDatabaseUrl || !prodDirectUrl)) {
	console.error('❌ Variáveis de produção não encontradas');
	console.error('Certifique-se de que DATABASE_URL e DIRECT_URL estão definidas no ambiente');
	process.exit(1);
}

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');

// Configurações por ambiente
const configs = {
    development: {
        name: 'Desenvolvimento (Local PostgreSQL)',
        provider: 'postgresql',
        hasDirectUrl: true,
        envVars: {
            DATABASE_URL: devDatabaseUrl,
            DIRECT_URL: devDirectUrl
        }
    },
    production: {
        name: 'Produção (Supabase PostgreSQL)',
        provider: 'postgresql', 
        hasDirectUrl: true,
        envVars: {
            DATABASE_URL: prodDatabaseUrl,
            DIRECT_URL: prodDirectUrl
        }
    }
};

const config = configs[environment];

if (!config) {
    console.error(`❌ Ambiente inválido: ${environment}`);
    console.log('Ambientes disponíveis: development, production');
    process.exit(1);
}

console.log(`🔧 Configurando para: ${config.name}`);

// Atualizar schema.prisma
let schema = fs.readFileSync(schemaPath, 'utf8');

const datasourceRegex = /datasource db \{[\s\S]*?\}/;
const newDatasource = config.hasDirectUrl
    ? `datasource db {
            provider  = "${config.provider}"
            url       = env("DATABASE_URL")
            directUrl = env("DIRECT_URL")
        }`
    : `datasource db {
            provider = "${config.provider}"
            url      = env("DATABASE_URL")
        }`;

schema = schema.replace(datasourceRegex, newDatasource);
fs.writeFileSync(schemaPath, schema);

// Atualizar .env apenas em desenvolvimento
if (environment === 'development' && fs.existsSync(envPath)) {
	let envContent = fs.readFileSync(envPath, 'utf8');

	envContent = envContent.replace(
		/^DATABASE_URL=.*/m,
		`DATABASE_URL="${config.envVars.DATABASE_URL}"`
	);

	if (config.hasDirectUrl) {
		if (envContent.includes('DIRECT_URL=')) {
			envContent = envContent.replace(
				/^DIRECT_URL=.*/m,
				`DIRECT_URL="${config.envVars.DIRECT_URL}"`
			);
		} else {
			envContent += `\nDIRECT_URL="${config.envVars.DIRECT_URL}"`;
		}
	}

	fs.writeFileSync(envPath, envContent);
}

console.log(`✅ Configurado para ambiente: ${environment}`);
console.log(`📊 Provider: ${config.provider}`);
console.log(`🏷️  Nome: ${config.name}`);

if (environment === 'production') {
	console.log('✅ Usando variáveis de ambiente do sistema');
}