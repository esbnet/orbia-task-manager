---
description: "Cria ou refatora endpoint Next.js em src/app/api seguindo Clean Architecture do Orbia."
name: "Criar Endpoint Clean"
argument-hint: "Ex.: criar GET /api/habits/summary com filtros x e y"
agent: "orbia-clean-architect"
model: "GPT-5 (copilot)"
---
Implemente a solicitacao abaixo como endpoint em src/app/api seguindo as regras do projeto:

{{input}}

Checklist obrigatorio:
- Autenticacao e validacao de entrada.
- Logica de negocio em use case/service (nao no handler).
- Uso de DI (UseCaseFactory/container) quando aplicavel.
- Tratamento de erro consistente sem expor detalhe sensivel.
- Compatibilidade singular/plural quando existir namespace legado.
- Incluir/ajustar testes relevantes se houver mudanca de regra de negocio.

Antes de codar, leia e siga:
- docs/codebase-overview.md
- docs/architecture-refactor-log.md
- docs/DAILY_REQUIREMENTS_REVIEW.md
- .github/copilot-instructions.md
