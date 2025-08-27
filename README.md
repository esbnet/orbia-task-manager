# 📋 Task Manager - Clean Architecture

> Uma aplicação completa de gerenciamento de tarefas implementada com **Clean Architecture** e princípios **SOLID**, demonstrando boas práticas de desenvolvimento de software.

![Tela da aplicação](./src/assets/tela.jpeg)

## 🎯 Sobre o Projeto

Este projeto é uma aplicação **full-stack** desenvolvida para demonstrar a implementação prática da **Clean Architecture** em um contexto real. Apesar da simplicidade do domínio (gerenciamento de tarefas), a aplicação implementa uma arquitetura robusta e escalável.

### ✨ Funcionalidades

#### 📅 **Tarefas Diárias (Daily)**
- ✅ Criar tarefas com repetição (diária, semanal, mensal)
- ✅ Gerenciar subtarefas
- ✅ Marcar como concluída com log de histórico
- ✅ Filtros por data e status
- ✅ Sistema de tags e dificuldade

#### 📝 **Afazeres (Todos)**
- ✅ Criar tarefas pontuais
- ✅ Gerenciar subtarefas
- ✅ Sistema de prioridades
- ✅ Controle de conclusão
- ✅ Organização por tags

#### 🔄 **Hábitos (Habits)**
- ✅ Criar hábitos recorrentes
- ✅ Sistema de reset (diário, semanal, mensal)
- ✅ Tracking de progresso
- ✅ Níveis de dificuldade
- ✅ Histórico de conclusões

#### 🏷️ **Sistema de Tags**
- ✅ Criação e gerenciamento de tags
- ✅ Cores personalizadas
- ✅ Associação com tarefas
- ✅ Filtros por categoria

## 🏗️ Arquitetura

### Clean Architecture Implementada

```
📁 src/
├── 🎯 domain/           # Camada de Domínio
│   ├── entities/        # Entidades de negócio
│   ├── repositories/    # Interfaces dos repositórios
│   └── value-objects/   # Objetos de valor
├── 🔧 use-cases/        # Camada de Aplicação
│   ├── daily/          # Casos de uso para Daily
│   ├── todo/           # Casos de uso para Todo
│   ├── habit/          # Casos de uso para Habit
│   └── tag/            # Casos de uso para Tag
├── 🔌 infra/           # Camada de Infraestrutura
│   ├── repositories/   # Implementações dos repositórios
│   │   ├── database/   # Repositórios Prisma
│   │   └── backend/    # Repositórios API
│   └── services/       # Serviços de infraestrutura
├── 🖥️ app/             # Camada de Apresentação
│   └── api/            # Endpoints da API
└── ⚛️ components/       # Componentes React
```

### 🎯 Princípios SOLID Aplicados

- **S** - Single Responsibility: Cada classe tem uma única responsabilidade
- **O** - Open/Closed: Extensível sem modificar código existente
- **L** - Liskov Substitution: Implementações podem ser substituídas
- **I** - Interface Segregation: Interfaces específicas e coesas
- **D** - Dependency Inversion: Dependências abstraídas por interfaces

## 🛠️ Tecnologias

### Frontend
- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática e IntelliSense
- **Tailwind CSS** - Estilização utilitária
- **Shadcn/ui** - Componentes acessíveis e customizáveis
- **React Hook Form** - Gerenciamento de formulários
- **Date-fns** - Manipulação de datas

### Backend
- **Next.js API Routes** - Endpoints serverless
- **Prisma ORM** - Mapeamento objeto-relacional
- **Postgres** - Banco de dados (desenvolvimento)

### Arquitetura
- **Clean Architecture** - Separação de responsabilidades
- **SOLID Principles** - Princípios de design orientado a objetos
- **Repository Pattern** - Abstração de acesso a dados
- **Use Case Pattern** - Lógica de negócio isolada
- **Dependency Injection** - Inversão de controle

## 🔗 API Endpoints

### 📅 Daily Tasks
```http
GET    /api/daily              # Listar tarefas diárias
POST   /api/daily              # Criar tarefa diária
PATCH  /api/daily              # Atualizar tarefa diária
DELETE /api/daily?id={id}      # Deletar tarefa diária
```

### 📝 Todos
```http
GET    /api/todos              # Listar todos
POST   /api/todos              # Criar todo
PATCH  /api/todos              # Atualizar todo
DELETE /api/todos?id={id}      # Deletar todo
```

### 🔄 Habits
```http
GET    /api/habits             # Listar hábitos
POST   /api/habits             # Criar hábito
PATCH  /api/habits             # Atualizar hábito
DELETE /api/habits?id={id}     # Deletar hábito
```

### 🏷️ Tags
```http
GET    /api/tags               # Listar tags
POST   /api/tags               # Criar tag
PATCH  /api/tags               # Atualizar tag
DELETE /api/tags?id={id}       # Deletar tag
```

### 📋 Subtasks
```http
# Daily Subtasks
GET    /api/daily-subtasks?dailyId={id}  # Listar por daily
POST   /api/daily-subtasks              # Criar subtask
PATCH  /api/daily-subtasks              # Atualizar subtask
DELETE /api/daily-subtasks?id={id}     # Deletar subtask

# Todo Subtasks
GET    /api/todo-subtasks?todoId={id}   # Listar por todo
POST   /api/todo-subtasks               # Criar subtask
PATCH  /api/todo-subtasks               # Atualizar subtask
DELETE /api/todo-subtasks?id={id}      # Deletar subtask
```

### 📊 Logs
```http
POST   /api/daily-logs         # Registrar conclusão de daily
POST   /api/todo-logs          # Registrar conclusão de todo
POST   /api/habit-logs         # Registrar conclusão de hábito
```

## 🚀 Setup e Implantação

### Pré-requisitos
- Node.js 18+
- pnpm, npm ou yarn
- Git

### 1️⃣ Clonagem e Instalação
```bash
# Clonar repositório
git clone https://github.com/esbnet/task-manager-clean-arch-example.git
cd task-manager-clean-arch-example

# Instalar dependências
npm install
```

### 2️⃣ Configuração do Banco
```bash
# Gerar cliente Prisma
npx prisma generate

# Executar migrações
npx prisma db push

# (Opcional) Visualizar banco
npx prisma studio
```

### 3️⃣ Variáveis de Ambiente
Crie um arquivo `.env.local`:
```env
# Database
DATABASE_URL="file:./dev.db"

# Next.js
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 4️⃣ Desenvolvimento
```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Aplicação disponível em http://localhost:3000
```

### 5️⃣ Build e Deploy
```bash
# Build para produção
npm run build

# Iniciar em produção
npm start
```

### 🐳 Docker (Opcional)
```bash
# Build da imagem
docker build -t task-manager .

# Executar container
docker run -p 3000:3000 task-manager
```

### ☁️ Deploy na Vercel
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## 🧪 Testes
```bash
# Executar testes unitários
npm test

# Testes com coverage
npm run test:coverage

# Testes e2e
npm run test:e2e
```

## 📚 Estrutura de Pastas Detalhada

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API Routes
│   ├── globals.css     # Estilos globais
│   ├── layout.tsx      # Layout principal
│   └── page.tsx        # Página inicial
├── components/         # Componentes React
│   ├── ui/            # Componentes base (Shadcn)
│   ├── daily/         # Componentes de Daily
│   ├── todo/          # Componentes de Todo
│   └── habit/         # Componentes de Habit
├── contexts/          # Context API
├── domain/            # Camada de Domínio
├── hooks/             # Custom Hooks
├── infra/             # Infraestrutura
├── lib/               # Utilitários
├── types/             # Definições de tipos
├── use-cases/         # Casos de uso
└── utils/             # Funções utilitárias
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Esbnet** - [GitHub](https://github.com/esbnet)

---

⭐ **Se este projeto te ajudou, deixe uma estrela!**


=========================

🔧 Configuração Atual:
Desenvolvimento (Local):
Provider: postgresql

Database: postgresql://admin:admin123@localhost:5432/taskmanager

Usa directUrl para melhor performance

Produção (Supabase):
Provider: postgresql

Database: Supabase PostgreSQL na nuvem

Connection pooling otimizado

📋 Scripts disponíveis:
```bash
# Configurar para desenvolvimento (PostgreSQL local)
npm run db:dev

# Configurar para produção (PostgreSQL Supabase)
npm run db:prod

# Push do schema para desenvolvimento
npm run db:push:dev

# Push do schema para produção  
npm run db:push:prod
```

🎯 Benefícios:
✅ Consistência: PostgreSQL em ambos ambientes
✅ Recursos avançados: Arrays, JSON, etc. em desenvolvimento
✅ Paridade: Mesmo comportamento local e produção
✅ Alternância fácil: Scripts automatizados
