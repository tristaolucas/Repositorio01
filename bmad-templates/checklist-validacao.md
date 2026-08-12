# Checklist de Validação — BMAD Method

Use este checklist em cada transição de fase do workflow.

---

## Fase: Clarify → Plan

- [ ] Ideia documentada em formato claro
- [ ] Problema identificado e validado
- [ ] Público-alvo definido
- [ ] PRFAQ criado (se aplicável)
- [ ] Usuário aprovou prosseguir para planejamento

## Fase: Plan → Build

### PRD
- [ ] PRD criado e preenchido
- [ ] Validação 7D completa (todas as 7 dimensões verificadas)
- [ ] Métricas de sucesso definidas
- [ ] Riscos identificados com mitigações
- [ ] Usuário aprovou PRD

### Arquitetura
- [ ] Stack tecnológica definida com justificativas
- [ ] Diagrama de componentes criado
- [ ] Modelo de dados definido
- [ ] APIs e interfaces especificadas
- [ ] ADRs registrados para decisões-chave
- [ ] Requisitos não-funcionais endereçados
- [ ] Usuário aprovou arquitetura

### UX (se aplicável)
- [ ] UX Spine criado
- [ ] Fluxos de usuário mapeados
- [ ] Estados de tela documentados (empty, loading, error, success)
- [ ] Wireframes criados
- [ ] Acessibilidade considerada
- [ ] Usuário aprovou UX

### Stories
- [ ] Épicos identificados
- [ ] Stories decompostas com contexto completo
- [ ] Critérios de aceitação definidos
- [ ] Dependências mapeadas
- [ ] Ordem de implementação definida

## Fase: Build → Verify

- [ ] Código implementado conforme story
- [ ] Testes escritos e passando
- [ ] Code review realizado (plan-aware)
- [ ] Quality gates atendidos
- [ ] Documentação atualizada

## Fase: Verify → Learn

- [ ] Todos os critérios de aceitação validados
- [ ] Nenhum BLOCKER pendente no review
- [ ] QA aprovado
- [ ] Deploy realizado (se aplicável)
- [ ] Métricas de sucesso sendo medidas
- [ ] Lições aprendidas registradas
