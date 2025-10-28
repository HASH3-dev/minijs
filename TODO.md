# TODO - Sistema de Rotas e Melhorias

## Progresso Geral: 88/135 tarefas (65%)

---

## ✅ FASE 1: Sistema de Escopos no DI (15/16) ✓

- [x] 1.1. Criar enum `InjectionScope` (SINGLETON, BY_COMPONENT)
- [x] 1.2. Criar interface `InjectableOptions` com campo scope
- [x] 1.3. Adicionar symbol `SCOPE_METADATA` para metadata
- [x] 1.4. Atualizar decorator `@Injectable` para aceitar options
- [x] 1.5. Criar helper `getScope(token)` para ler metadata
- [x] 1.6. Adicionar campo `ownerComponent` no Injector
- [x] 1.7. Adicionar `componentInstances: WeakMap` no Injector
- [x] 1.8. Modificar `Injector.constructor` para receber ownerComponent
- [x] 1.9. Modificar `Injector.get()` para suportar BY_COMPONENT
- [x] 1.10. Criar método `Injector.getComponentScoped()`
- [x] 1.11. Criar método `Injector.instantiateComponentScoped()`
- [x] 1.12. Atualizar decorator `@Inject` para passar contexto do componente
- [x] 1.13. Atualizar decorator `@Provide` para passar ownerComponent
- [x] 1.14. Exportar novos tipos e enums no index.ts
- [x] 1.15. Build do pacote @mini/di
- [ ] 1.16. Testes unitários do sistema de escopos (pode ser feito depois)

---

## 📦 FASE 2: Estrutura do Pacote Router (6/6) ✓

- [x] 2.1. Criar diretório `packages/router/`
- [x] 2.2. Criar `packages/router/package.json`
- [x] 2.3. Criar `packages/router/tsconfig.json`
- [x] 2.4. Criar estrutura de pastas (src/, types/, decorators/)
- [x] 2.5. Configurar dependências (@mini/core, @mini/di, @mini/jsx, rxjs)
- [x] 2.6. Adicionar scripts de build

---

## 🌐 FASE 3: Router Global (Singleton) (9/9) ✓

- [x] 3.1. Criar `packages/router/src/types.ts` com interfaces base
- [x] 3.2. Criar `packages/router/src/RouteMatch.ts` - lógica de matching
  - [x] 3.2.1. Implementar parsing de pattern (`/user/:id`)
  - [x] 3.2.2. Implementar matching com regex
  - [x] 3.2.3. Implementar extração de params
  - [x] 3.2.4. Implementar score para best match
- [x] 3.3. Criar `packages/router/src/Router.ts` - serviço global
  - [x] 3.3.1. Criar BehaviorSubject para rota atual
  - [x] 3.3.2. Implementar `initialize()` com History API listener
  - [x] 3.3.3. Implementar `syncUrl()` para atualizar estado
  - [x] 3.3.4. Implementar `navigate(path, options)`
  - [x] 3.3.5. Implementar `parseQuery()` para query strings
  - [x] 3.3.6. Implementar `matchPath()` usando RouteMatch
  - [x] 3.3.7. Criar getters para currentPath, currentQuery
  - [x] 3.3.8. Exportar singleton instance
- [x] 3.4. Adicionar decorator `@Injectable()` no Router
- [x] 3.5. Testar navegação básica

---

## 🎯 FASE 4: RouterService (BY_COMPONENT) (12/12) ✓

- [x] 4.1. Criar `packages/router/src/RouterService.ts`
- [x] 4.2. Adicionar `@Injectable({ scope: InjectionScope.BY_COMPONENT })`
- [x] 4.3. Implementar constructor recebendo Component
- [x] 4.4. Implementar getter `params` (extrai do route metadata)
- [x] 4.5. Implementar getter `query`
- [x] 4.6. Implementar getters básicos (hash, href, protocol, host, pathname)
- [x] 4.7. Implementar método `getSegment()`
- [x] 4.8. Implementar método `push(path)`
- [x] 4.9. Implementar método `replace(path)`
- [x] 4.10. Implementar método `back()`
- [x] 4.11. Implementar observables opcionais (params$, query$)
- [x] 4.12. Testes do RouterService

---

## 🏷️ FASE 5: Decorator @Route (6/6) ✓

- [x] 5.1. Criar `packages/router/src/decorators/Route/constants.ts`
- [x] 5.2. Criar `packages/router/src/decorators/Route/types.ts`
- [x] 5.3. Criar `packages/router/src/decorators/Route/index.ts`
- [x] 5.4. Implementar decorator `@Route(path)`
- [x] 5.5. Armazenar metadata no componente
- [x] 5.6. Exportar no index principal

---

## 🔀 FASE 6: RouteSwitcher Component (8/8) ✓

- [x] 6.1. Criar `packages/router/src/RouteSwitcher.tsx`
- [x] 6.2. Implementar constructor com inicialização do Router
- [x] 6.3. Implementar método `extractRoutes()` dos children
- [x] 6.4. Implementar lógica de matching na render()
- [x] 6.5. Implementar injeção via DI no componente matched
- [x] 6.6. Implementar fallback 404
- [x] 6.7. Implementar nested routing (rotas filhas)
- [x] 6.8. Testes do RouteSwitcher

---

## 🛡️ FASE 7: Guards Assíncronos (9/9) ✓

- [x] 7.1. Revisar `packages/core/src/decorators/Guard/types.ts`
- [x] 7.2. Confirmar que interface Guard já aceita Promise e Observable
- [x] 7.3. Atualizar `packages/core/src/decorators/Guard/index.ts`
- [x] 7.4. Implementar conversão de resultado para Observable
- [x] 7.5. Usar `forkJoin` para executar guards em paralelo
- [x] 7.6. Implementar tratamento de erros com `catchError`
- [x] 7.7. Retornar observable que renderiza baseado nos resultados
- [x] 7.8. Build do pacote core
- [x] 7.9. Testes de guards assíncronos

---

## 📊 FASE 8: Decorator @UseResolvers (9/9) ✓

- [x] 8.1. Criar `packages/core/src/decorators/Resolver/constants.ts`
- [x] 8.2. Criar `packages/core/src/decorators/Resolver/types.ts`
  - [x] 8.2.1. Interface `Resolver` com método `resolve()`
  - [x] 8.2.2. Type `ResolverClass`
  - [x] 8.2.3. Interface `ResolverState` (loading/success/error/empty)
- [x] 8.3. Criar `packages/core/src/decorators/Resolver/index.ts`
- [x] 8.4. Implementar decorator `@UseResolvers(resolvers[])`
- [x] 8.5. Criar wrapper class que gerencia estado
- [x] 8.6. Implementar `executeResolvers()` assíncrono
- [x] 8.7. Prover dados via DI para componente filho
- [x] 8.8. Integrar com métodos de render (loading/error/empty)
- [x] 8.9. Exportar no index.ts do core

---

## 📥 FASE 9: Decorator @LoadData (8/8) ✓

- [x] 9.1. Criar `packages/core/src/decorators/LoadData/constants.ts`
- [x] 9.2. Criar `packages/core/src/decorators/LoadData/types.ts`
- [x] 9.3. Criar `packages/core/src/decorators/LoadData/index.ts`
- [x] 9.4. Implementar decorator `@LoadData(isEmptyFn?)`
- [x] 9.5. Centralizar estado no Component com BehaviorSubject
- [x] 9.6. Integrar com métodos de render alternativos via RenderState
- [x] 9.7. Atualizar Resolver para usar RenderState com isEmpty()
- [x] 9.8. Exportar no index.ts do core

---

## 🎨 FASE 10: Integração de Estados de Render (6/6) ✓

- [x] 10.1. Atualizar Component.ts para suportar métodos opcionais
- [x] 10.2. Documentar convenção de métodos (renderLoading, renderError, renderEmpty)
- [x] 10.3. Atualizar Application.ts se necessário (já estava correto)
- [x] 10.4. Garantir que Resolvers chamam métodos corretos
- [x] 10.5. Garantir que LoadData chama métodos corretos
- [x] 10.6. Build de todos os pacotes afetados

---

## 📚 FASE 11: Exports e Documentação (0/7)

- [ ] 11.1. Atualizar `packages/router/src/index.ts` com todos exports
- [ ] 11.2. Atualizar `packages/core/src/index.ts` com novos decorators
- [ ] 11.3. Atualizar `packages/di/src/index.ts` com escopos
- [ ] 11.4. Criar/atualizar arquivos README de cada pacote
- [ ] 11.5. Documentar API do RouterService
- [ ] 11.6. Documentar uso de escopos no DI
- [ ] 11.7. Build final de todos os pacotes

---

## 🎮 FASE 12: Exemplos no Playground (0/10)

- [ ] 12.1. Criar exemplo básico de roteamento
  - [ ] 12.1.1. HomePage component
  - [ ] 12.1.2. AboutPage component
  - [ ] 12.1.3. App com RouteSwitcher
- [ ] 12.2. Criar exemplo com parâmetros dinâmicos
  - [ ] 12.2.1. UserPage com :id
  - [ ] 12.2.2. Usar RouterService para acessar params
- [ ] 12.3. Criar exemplo com query params
- [ ] 12.4. Criar exemplo com Guards
  - [ ] 12.4.1. AuthGuard síncrono
  - [ ] 12.4.2. AuthGuard assíncrono
- [ ] 12.5. Criar exemplo com Resolvers
  - [ ] 12.5.1. UserResolver
  - [ ] 12.5.2. Componente com estados de loading
- [ ] 12.6. Criar exemplo com @LoadData
- [ ] 12.7. Criar exemplo de navegação programática
- [ ] 12.8. Criar exemplo de nested routing
- [ ] 12.9. Atualizar App.tsx para incluir menu de navegação
- [ ] 12.10. Testar todos os exemplos no browser

---

## ✅ FASE 13: Testes e Validação (0/10)

- [ ] 13.1. Testes unitários do Router
- [ ] 13.2. Testes unitários do RouterService
- [ ] 13.3. Testes unitários do RouteMatch
- [ ] 13.4. Testes de integração do roteamento
- [ ] 13.5. Testes dos escopos DI
- [ ] 13.6. Testes dos Guards assíncronos
- [ ] 13.7. Testes dos Resolvers
- [ ] 13.8. Testes do LoadData
- [ ] 13.9. Testes E2E no playground
- [ ] 13.10. Correção de bugs encontrados

---

## ✨ FASE 14: Refinamentos Finais (0/7)

- [ ] 14.1. Revisar performance do sistema de rotas
- [ ] 14.2. Otimizar re-renders desnecessários
- [ ] 14.3. Melhorar mensagens de erro
- [ ] 14.4. Adicionar validações de uso incorreto
- [ ] 14.5. Code review geral
- [ ] 14.6. Atualizar SKETCH.md se necessário
- [ ] 14.7. Marcar TODO.md como concluído

---

## 🔄 FASE 15: Suporte a Render Assíncrono (0/15)

### Comportamento:
1. **Durante Promise pendente**: Renderiza `renderLoading()` do componente
   - Se `renderLoading()` também for assíncrono: renderiza vazio
2. **Ambos suportados**: Promises E Observables
3. **Em caso de erro**: Chama `renderError()` automaticamente
4. **Lifecycle**: `mounted$` só emite após Promise resolver/rejeitar

### Tarefas:
- [ ] 15.1. Atualizar tipos do Component.render() para aceitar Promise
- [ ] 15.2. Atualizar tipos do renderLoading/Error/Empty para aceitar Promise
- [ ] 15.3. Modificar `Application.renderBottomUp()` para async
- [ ] 15.4. Implementar detecção de Promise no resultado do render
- [ ] 15.5. Implementar renderização de renderLoading() durante Promise
- [ ] 15.6. Implementar tratamento de renderLoading() assíncrono (vazio)
- [ ] 15.7. Implementar try/catch para chamar renderError() em rejeições
- [ ] 15.8. Garantir que lifecycle só executa após Promise resolver
- [ ] 15.9. Atualizar processamento para suportar Promise + Observable
- [ ] 15.10. Garantir compatibilidade com Guards/Resolvers assíncronos
- [ ] 15.11. Testes de renders com Promises
- [ ] 15.12. Testes de erros em renders assíncronos
- [ ] 15.13. Exemplo no playground: async render
- [ ] 15.14. Exemplo no playground: async renderLoading
- [ ] 15.15. Exemplo no playground: tratamento de erros

---

## 📝 Notas de Implementação

### Prioridades:
1. FASE 1 é crítica - base para tudo
2. FASES 2-6 são o core do roteamento
3. FASES 7-9 são features adicionais
4. FASE 15 pode ser paralela às outras

### Commits:
- Fazer commit ao fim de cada fase completa
- Build e test antes de cada commit
- Mensagens descritivas seguindo padrão

### Testes:
- Testar incrementalmente
- Não avançar fase se anterior tiver bugs críticos
- Exemplos no playground são essenciais para validação

---

**Data de Início**: 28/10/2025
**Última Atualização**: 28/10/2025 11:33
