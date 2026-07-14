---
description: "Use quando alterar schema Prisma, migrations ou repositórios em src/infra/database/prisma. Aplica regras de seguranca para evolucao de banco e consistencia de dominio."
name: "Prisma e Dados Orbia"
applyTo:
  - "prisma/**/*.prisma"
  - "prisma/migrations/**"
  - "src/infra/database/prisma/**/*.ts"
  - "scripts/prisma-*.js"
---
# Prisma e Camada de Dados - Orbia

## Regras
- Mudancas de schema devem vir com migration correspondente.
- Nao introduzir mudanca destrutiva sem plano de compatibilidade.
- Garantir que nomes e campos persistidos estejam alinhados as entidades de dominio.
- Evitar logica de negocio rica em repositórios Prisma.

## Fluxo Recomendado
1. Atualizar schema.
2. Criar/aplicar migration.
3. Executar prisma generate.
4. Validar endpoints afetados.

## Comandos uteis
- npx prisma migrate deploy
- pnpm prisma:generate
- pnpm prisma:seed

## Sinais de Problema Comum
- Erros 500 com relation does not exist normalmente indicam migrations pendentes em banco novo.
