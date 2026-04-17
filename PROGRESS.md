# WPP-Bot Monorepo - Progresso de Desenvolvimento

**Data de Inicio:** 13/04/2026  
**Ultima atualizacao:** 17/04/2026  
**Status Geral:** Fases 1.5 e 1.6 concluidas

---

## Roadmap Geral

```text
FASE 1: Backend Base          100% concluido
    |- 1.1 Prisma Config      concluido
    |- 1.2 DTOs + Types       concluido
    |- 1.3 Services           concluido
    |- 1.4 Controllers        concluido
    |- 1.5 PostgreSQL         concluido
    |- 1.6 Auth               concluido
    |- 1.7 Validacao + ACL    fila
    `- 1.8 Testes             fila

FASE 2: Frontend Basico       nao iniciado
FASE 3: Integracao & Deploy   nao iniciado
```

---

## O Que Ja Foi Feito

### Fase 1.0 - Infraestrutura Base

- Monorepo inicializado com Nx
- NestJS criado em `apps/backend/`
- Angular 20 criado em `apps/frontend/`
- Pacote `packages/shared/` criado
- Git inicializado e primeiro commit realizado
- Projeto enviado para GitHub: `https://github.com/vsantus/wpp-bot-monorepo`
- Dependencias instaladas (`JWT`, `Prisma`, `Google Sheets API`, etc.)

### Fase 1.1 - Prisma Configurado

**Arquivos principais:**

- `apps/backend/.env`
- `apps/backend/.env.example`
- `apps/backend/prisma/schema.prisma`
- `apps/backend/prisma.config.ts`

**Modelos criados no schema:**

- `User`
- `Service`
- `TimeSlot`
- `Appointment`
- enums `Status` e `PaymentMethod`

### Fase 1.2 - DTOs + Enums Compartilhados

**Estrutura criada em `packages/shared/src/`:**

```text
packages/shared/src/
|- dto/
|  |- user.dto.ts
|  |- timeslot.dto.ts
|  |- appointment.dto.ts
|  `- index.ts
|- enums/
|  `- index.ts
`- index.ts
```

**Exemplo de import:**

```ts
import { CreateUserDto, AppointmentStatus } from '@monorepo/shared';
```

### Fase 1.3 - Services do Backend

**Implementado em `apps/backend/src/modules/`:**

- `users/users.service.ts`
  - `create`
  - `findByContact`
  - `findById`
  - `update`
  - `delete`
- `timeslots/timeslots.service.ts`
  - `create`
  - `findAll`
  - `findAvailable`
  - `findById`
  - `update`
  - `block`
  - `unblock`
  - `delete`
- `appointments/appointments.service.ts`
  - `create`
  - `findAll`
  - `findByClient`
  - `findById`
  - `cancel`
  - `reschedule`
  - `delete`
- `common/prisma/prisma.service.ts`
- `common/prisma/prisma.module.ts`

**Regras de negocio adicionadas:**

- validacao de usuario duplicado por `contact`
- validacao de `TimeSlot` duplicado por `day + hour`
- bloqueio e desbloqueio de horarios
- criacao, cancelamento e reagendamento de agendamentos
- uso de transacoes Prisma para manter consistencia entre `Appointment` e `TimeSlot`

### Fase 1.4 - Controllers (Endpoints)

**Controllers criados:**

- `users/users.controller.ts`
- `timeslots/timeslots.controller.ts`
- `appointments/appointments.controller.ts`

**Rotas REST disponiveis atualmente:**

```http
POST   /users
GET    /users/:id
GET    /users/contact/:contact
PATCH  /users/:id
DELETE /users/:id

POST   /timeslots
GET    /timeslots
GET    /timeslots/available
GET    /timeslots/:id
PATCH  /timeslots/:id
PATCH  /timeslots/:id/block
PATCH  /timeslots/:id/unblock
DELETE /timeslots/:id

POST   /appointments
GET    /appointments
GET    /appointments/client/:clientId
GET    /appointments/:id
PATCH  /appointments/:id/cancel
PATCH  /appointments/:id/reschedule
DELETE /appointments/:id
```

**Infra complementar:**

- `ValidationPipe` global configurado em `apps/backend/src/main.ts`
- build do backend validado com sucesso
- Prisma Client gerado com `prisma.config.ts`

### Fase 1.6 - Autenticacao (Auth)

**Implementado em `apps/backend/src/modules/auth/`:**

- `auth.module.ts`
- `auth.controller.ts`
- `auth.service.ts`
- `jwt.strategy.ts`
- `jwt-auth.guard.ts`
- `current-user.decorator.ts`

**Rotas adicionadas:**

```http
POST /auth/register
POST /auth/login
GET  /auth/me
GET  /appointments/my
```

**Escopo entregue:**

- cadastro com senha
- login por `contact + password`
- geracao de JWT
- guard para rotas autenticadas
- leitura do usuario autenticado via decorator
- endpoint para listar os proprios agendamentos

### Fase 1.5 - Migracao para PostgreSQL

**Entregue:**

- provider do Prisma alterado para `postgresql`
- `DATABASE_URL` configurada para o banco local `barbearia`
- migration criada em `apps/backend/prisma/migrations/20260417200832_init_postgres/`
- migration aplicada com sucesso no PostgreSQL
- Prisma Client regenerado apos a migracao

**Banco atual:**

- servidor: `localhost:5432`
- banco: `barbearia`
- usuario: `postgres`

---

## Proximos Passos

### Fase 1.7 - Validacao + Regras de Acesso

Melhorias de seguranca e consistencia:

- adicionar `class-validator` nos DTOs
- validar telefone, email e campos obrigatorios
- restringir rotas de admin
- permitir que cliente acesse apenas os proprios agendamentos

### Fase 1.8 - Testes

Cobrir backend com testes:

- testes unitarios dos services
- testes de integracao dos endpoints principais
- validacao dos fluxos de agendamento, cancelamento e reagendamento

### Fase 2 - Frontend

Componentes Angular para login, cadastro, dashboard e consumo da API.

### Fase 3 - Deploy & Integracoes

Google Sheets API, CI/CD, deploy e integracoes externas.

---

## Estrutura de Diretorios Atual

```text
wpp-bot-monorepo/
|- apps/
|  |- backend/
|  |  |- prisma/
|  |  |  |- schema.prisma
|  |  |  `- prisma.config.ts
|  |  |- src/
|  |  |  |- common/
|  |  |  |  `- prisma/
|  |  |  |- modules/
|  |  |  |  |- appointments/
|  |  |  |  |- auth/
|  |  |  |  |- sheets/
|  |  |  |  |- timeslots/
|  |  |  |  `- users/
|  |  |  `- main.ts
|  |  |- .env
|  |  |- .env.example
|  |  `- package.json
|  `- frontend/
|     `- src/
|- packages/
|  `- shared/
|     `- src/
|        |- dto/
|        |- enums/
|        `- index.ts
|- README.md
`- PROGRESS.md
```

---

## Comandos Uteis

```bash
# Na raiz do projeto
cd wpp-bot-monorepo

# Backend - desenvolvimento
cd apps/backend
npm run start:dev

# Backend - Prisma
npx prisma generate
npx prisma migrate dev
npx prisma studio

# Frontend - desenvolvimento
cd apps/frontend
ng serve

# Git
git add .
git commit -m "feat: description"
git push
```

---

## Informacoes Importantes

- **Banco alvo:** PostgreSQL local
- **Banco criado:** `barbearia`
- **Status da migration:** concluida no PostgreSQL local
- **JWT Secret:** alterar em `.env` antes de um deploy real
- **Admin JID:** configurar em `.env`
- **Port Backend:** `3000` por padrao

---

## Para Continuar

**Proxima sessao:**

```text
1. Adicionar validacao real nos DTOs
2. Restringir rotas por perfil e ownership
3. Criar testes do backend
4. Iniciar integracao com frontend
5. Revisar documentacao e fluxo de uso
```

---

Criado com apoio de IA e atualizado durante o desenvolvimento do projeto.
