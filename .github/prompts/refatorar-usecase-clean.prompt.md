---
description: "Refatora fluxo para use-case/application service mantendo compatibilidade e baixo risco no Orbia."
name: "Refatorar UseCase Clean"
argument-hint: "Ex.: mover regra de conclusao de habito da rota para application/use-cases"
agent: "orbia-clean-architect"
model: "GPT-5 (copilot)"
---
Refatore a solicitacao abaixo para ficar aderente a Clean Architecture do Orbia:

{{input}}

Objetivos:
- Extrair regra de negocio para src/application/use-cases ou src/domain/services.
- Manter handlers HTTP finos em src/app/api.
- Evitar regressao de contrato e manter compatibilidade de rota.
- Atualizar DI/factory quando necessario.
- Incluir testes de regressao em use-case quando houver mudanca comportamental.

Entregue:
1. Implementacao completa.
2. Lista de riscos e mitigacoes.
3. Validacoes executadas.
