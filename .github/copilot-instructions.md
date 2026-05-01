# Diretrizes do Projeto Orbia

## Contexto
- Este projeto usa Clean Architecture com camadas em src/domain, src/application, src/infra e src/app.
- Antes de propor mudanças estruturais, consulte:
  - docs/codebase-overview.md
  - docs/architecture-refactor-log.md
  - docs/DAILY_REQUIREMENTS_REVIEW.md
  - ARCHITECTURE_REVIEW.md

## Regras Gerais
- Mantenha regras de negocio em domain/services ou application/use-cases.
- API routes em src/app/api devem ser finas: autenticar, validar entrada, chamar use case/service e retornar resposta HTTP.
- Evite mover logica para repositórios Prisma ou componentes React.
- Prefira UseCaseFactory e container de DI para criar dependencias.
- Preserve compatibilidade de rotas quando houver namespace singular/plural (ex.: daily/dailies).

## Padrões de Implementação
- Entidades e contratos: src/domain.
- Orquestração de casos de uso: src/application/use-cases.
- Persistência e adapters: src/infra.
- UI e hooks de consumo: src/components e src/hooks.
- Para entradas externas (API/form), valide e sanitize com utilitarios do projeto (ex.: infra/validation).

## Banco de Dados e Prisma
- O projeto depende de PostgreSQL + Prisma.
- Em ambiente novo, aplique migrations antes de validar endpoints:
  - npx prisma migrate deploy
- Evite mudanças destrutivas sem migração explícita.

## Testes e Verificação
- Comandos preferenciais:
  - pnpm test
  - pnpm lint
  - pnpm build
- Quando alterar regra de negocio, priorize incluir/ajustar testes de use-case.

## Estilo de Mudança
- Faça mudanças pequenas e focadas.
- Não reformatar arquivos não relacionados.
- Documente decisões arquiteturais relevantes em docs/architecture-refactor-log.md quando aplicável.
