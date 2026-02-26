# Correção do Erro de Status

## Problema
Erro ao completar diária: `Unknown argument 'status'` no Prisma Client.

## Causa
O Prisma Client não foi regenerado após adicionar o campo `status` ao schema.

## Solução Aplicada

### 1. Regenerar Prisma Client
```bash
npx prisma generate
```

### 2. Adicionar campo `status` em todos os selects
- `findByUserId`: ✅
- `findById`: ✅ (corrigido)
- `list`: ✅
- `findByTags`: ✅

### 3. Atualizar registros existentes
```sql
UPDATE dailies SET status = 'active' WHERE status IS NULL;
```

## Resultado
- ✅ Prisma Client atualizado com campo `status`
- ✅ Todos os selects incluem o campo
- ✅ Registros existentes com status padrão
- ✅ Filtros de arquivamento funcionando

## Próximos Passos
Reinicie o servidor de desenvolvimento:
```bash
npm run dev
```
