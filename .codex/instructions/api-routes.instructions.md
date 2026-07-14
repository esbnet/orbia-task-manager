---
description: "Use quando criar ou alterar endpoints Next.js em src/app/api. Inclui padrão de auth, validação, arquitetura limpa e compatibilidade de rotas singular/plural."
name: "API Routes Orbia"
applyTo: "src/app/api/**/*.ts"
---
# API Routes - Orbia

## Objetivo
Manter handlers HTTP simples, seguros e alinhados a Clean Architecture.

## Checklist de Implementação
- Autenticar no inicio do handler.
- Validar e sanitizar entradas antes de chamar use case.
- Delegar logica de negocio para application/use-cases ou application/services.
- Retornar respostas HTTP consistentes e mensagens claras.
- Tratar erros sem vazar detalhes sensíveis.

## Nao Fazer
- Nao colocar regras de negocio complexas diretamente na rota.
- Nao usar Prisma direto na rota quando houver use case/repository apropriado.
- Nao quebrar aliases/compatibilidade entre rotas singular/plural sem necessidade.

## Referencias
- docs/architecture-refactor-log.md
- docs/codebase-overview.md
