# BMAD Method Agent — Elaboração e Construção de Ideias e Projetos

## Visão Geral

Este repositório implementa o **BMAD Method** (Breakthrough Method for Agile AI-Driven Development)
adaptado para Claude Code. O foco é a **elaboração e construção de novas ideias e projetos**,
cobrindo desde a concepção até a implementação.

## Ciclo de Entrega (Delivery Loop)

O workflow segue 4 fases iterativas:

1. **Clarify (Clarificar)** — Transformar noções vagas em ideias claras
2. **Plan (Planejar)** — Desenvolver PRDs, arquitetura e especificações
3. **Build & Verify (Construir e Verificar)** — Implementar incrementalmente
4. **Learn & Adjust (Aprender e Ajustar)** — Feedback e iteração

## Agentes Disponíveis

Use subagentes especializados via `@agent-name` ou slash commands:

| Agente | Papel | Comando |
|--------|-------|---------|
| **Analyst** | Pesquisa, validação de ideias, criação de PRDs | `.claude/agents/bmad-analyst.md` |
| **Architect** | Design de sistema, decisões técnicas, ADRs | `.claude/agents/bmad-architect.md` |
| **PM** | Product briefs, roadmaps, priorização | `.claude/agents/bmad-pm.md` |
| **UX Designer** | Experiência do usuário, wireframes, fluxos | `.claude/agents/bmad-ux.md` |
| **Scrum Master** | Stories, épicos, planejamento de sprints | `.claude/agents/bmad-scrum-master.md` |
| **Dev** | Implementação de código seguindo specs | `.claude/agents/bmad-dev.md` |
| **QA** | Testes, validação, quality gates | `.claude/agents/bmad-qa.md` |
| **Review** | Code review consciente do plano | `.claude/agents/bmad-review.md` |

## Workflows Disponíveis

### 1. Full Method (Projetos Novos)
Para projetos greenfield com cerimônia completa:
`Clarify → Brief → PRD → Architecture → UX → Stories → Build → QA → Review`

### 2. Quick Dev (Mudanças Rápidas)
Para mudanças bem definidas em código existente:
`Clarify → Build → Verify`

### 3. Ideação (Brainstorm)
Para explorar e validar novas ideias:
`Brainstorm → PRFAQ → Brief → PRD`

## Templates

Os templates estão em `bmad-templates/`:
- `prd-template.md` — Product Requirements Document
- `architecture-template.md` — Documento de Arquitetura
- `story-template.md` — Template de User Story
- `brief-template.md` — Product Brief
- `ux-spine-template.md` — UX Design Spine
- `adr-template.md` — Architecture Decision Record
- `checklist-validacao.md` — Checklist de Validação 7 Dimensões

## Artefatos do Projeto

Documentos gerados durante o workflow ficam em `bmad-docs/`:
- PRDs aprovados
- Documentos de arquitetura
- Stories e épicos
- Briefs de produto
- ADRs (Architecture Decision Records)

## Regras de Operação

1. **Manter decisões explícitas** — Nunca tomar decisões implícitas; documentar cada escolha
2. **Preservar contexto** — Stories devem conter todo o contexto necessário para implementação
3. **Quality Gates** — Cada fase deve passar por validação antes de avançar
4. **Human-in-the-loop** — Sempre buscar aprovação do usuário em decisões-chave
5. **Right-sized process** — Adaptar a cerimônia ao tamanho da tarefa
