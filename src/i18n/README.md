# Sistema de Internacionalização (i18n)

Este documento explica como usar o sistema de internacionalização implementado na aplicação.

## Estrutura

```
src/i18n/
├── index.ts          # Funções principais para server-side
├── shared.ts         # Dicionários e utilitários compartilhados
└── README.md         # Esta documentação
```

## Idiomas Suportados

- **pt-BR**: Português (Brasil) - idioma padrão
- **en-US**: English (United States)
- **es-ES**: Español (España)

## Como Usar

### 1. Em Client Components

```tsx
"use client";

import { useTranslation } from "@/hooks/use-translation";

export function MyComponent() {
  const { t, locale } = useTranslation();

  return (
    <div>
      <h1>{t("navigation.tasks")}</h1>
      <p>{t("common.loading")}</p>
      <span>Idioma atual: {locale}</span>
    </div>
  );
}
```

### 2. Em Server Components

```tsx
import { getServerTranslator } from "@/i18n";

export default async function MyPage() {
  const { t, locale } = await getServerTranslator();

  return (
    <div>
      <h1>{t("profile.statistics")}</h1>
      <p>{t("common.comingSoon")}</p>
    </div>
  );
}
```

### 3. Com Parâmetros

```tsx
// Para strings com placeholders como "Olá, {name}!"
const message = t("welcome.greeting", { name: "João" });
```

## Estrutura do Dicionário

O dicionário está organizado em categorias:

```typescript
{
  common: {
    save: "Salvar",
    cancel: "Cancelar",
    // ...
  },
  navigation: {
    tasks: "Tarefas",
    performance: "Desempenho",
    // ...
  },
  forms: {
    title: "Título",
    difficulty: "Dificuldade",
    // ...
  },
  // ... outras categorias
}
```

### Categorias Disponíveis

- **common**: Textos comuns (botões, ações básicas)
- **navigation**: Itens de navegação
- **home**: Página inicial
- **tasks**: Relacionado a tarefas
- **forms**: Formulários
- **difficulty**: Níveis de dificuldade
- **repeat**: Opções de repetição
- **priority**: Níveis de prioridade
- **taskTypes**: Tipos de tarefa
- **messages**: Mensagens de sucesso/erro
- **delete**: Ações de exclusão
- **settings**: Configurações
- **profile**: Perfil do usuário

## Adicionando Novas Traduções

1. **Adicione a chave no dicionário** em `src/i18n/shared.ts`:

```typescript
const dictionaries: Record<Locale, Dict> = {
  "pt-BR": {
    myCategory: {
      myKey: "Meu texto em português",
    },
  },
  "en-US": {
    myCategory: {
      myKey: "My text in English",
    },
  },
  "es-ES": {
    myCategory: {
      myKey: "Mi texto en español",
    },
  },
};
```

2. **Use no componente**:

```tsx
const text = t("myCategory.myKey");
```

## Exemplos de Uso nos Formulários

### Formulário de Daily

```tsx
// Título
<Label>{t("forms.title")}</Label>
<Input placeholder={t("forms.newDaily")} />

// Dificuldade
<Label>{t("forms.difficulty")}</Label>
<SelectItem value="Fácil">{t("difficulty.easy")}</SelectItem>

// Botões
<Button>{t("common.save")}</Button>
<Button variant="outline">{t("common.cancel")}</Button>
```

### Mensagens de Toast

```tsx
// Sucesso
toast.success(t("messages.dailyCreated"));

// Erro
toast.error(t("messages.errorSaving"));
```

### Confirmação de Exclusão

```tsx
<DialogTitle>{t("common.areYouSure")}</DialogTitle>
<DialogDescription>{t("common.cannotUndo")}</DialogDescription>
<Button variant="destructive">
  {isDeleting ? t("common.deleting") : t("common.delete")}
</Button>
```

## Detecção de Idioma

O sistema detecta o idioma na seguinte ordem:

1. **Cookie**: `NEXT_LOCALE`
2. **Header**: `Accept-Language` do navegador
3. **Padrão**: `pt-BR`

## Mudança de Idioma

Para alterar o idioma, use a API de configuração do usuário:

```tsx
const { updateConfig } = useUserConfig();

await updateConfig({
  ...config,
  language: "en-US" // ou "pt-BR", "es-ES"
});
```

## Boas Práticas

1. **Use chaves descritivas**: `forms.title` em vez de `title`
2. **Agrupe por contexto**: Coloque textos relacionados na mesma categoria
3. **Seja consistente**: Use sempre as mesmas chaves para textos similares
4. **Teste todos os idiomas**: Verifique se as traduções fazem sentido
5. **Considere o tamanho**: Textos em diferentes idiomas podem ter tamanhos diferentes

## Aplicando em Componentes Existentes

Para aplicar i18n em um componente existente:

1. **Importe o hook**:
```tsx
import { useTranslation } from "@/hooks/use-translation";
```

2. **Use no componente**:
```tsx
const { t } = useTranslation();
```

3. **Substitua strings hardcoded**:
```tsx
// Antes
<Button>Salvar</Button>

// Depois
<Button>{t("common.save")}</Button>
```

4. **Teste com diferentes idiomas** para garantir que a interface funciona bem.

## Exemplo Completo

Veja o arquivo `daily-form-i18n-example.tsx` para um exemplo completo de como aplicar i18n em um formulário complexo.