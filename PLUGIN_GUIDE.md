# 🔌 Guia de Criação de Plugins

Este guia mostra como criar plugins customizados para estender o Mini Framework.

## 📋 Índice

1. [Anatomia de um Plugin](#anatomia-de-um-plugin)
2. [Passo a Passo](#passo-a-passo)
3. [Exemplos Práticos](#exemplos-práticos)
4. [Boas Práticas](#boas-práticas)
5. [Troubleshooting](#troubleshooting)

---

## 🔍 Anatomia de um Plugin

Um plugin no Mini Framework consiste em 3 partes:

```
1. Decorator       → Salva metadata na classe
2. Plugin Class    → Lê metadata e executa lógica
3. Registration    → Registra no lifecycleManager
```

### Fluxo Completo

```typescript
// 1. User aplica decorator
class MyComponent extends Component {
  @MyDecorator()  // ← Salva metadata
  myMethod() { }
}

// 2. Framework registra plugin
lifecycleManager.registerHook(new MyPlugin());

// 3. Component lifecycle
Application.executeLifecycle(component)
  ↓
lifecycleManager.executePhase(LifecyclePhase.AfterMount)
  ↓
MyPlugin.execute(component)  // ← Lê metadata e executa
```

---

## 📝 Passo a Passo

### Passo 1: Definir Metadata Key

Use `Symbol` para evitar colisões:

```typescript
// constants.ts
export const MY_METADATA_KEY = Symbol('my-plugin:metadata');
```

### Passo 2: Criar Decorator

O decorator apenas **salva metadata** na classe:

```typescript
// decorator.ts
import { MY_METADATA_KEY } from './constants';

export interface MyDecoratorConfig {
  option1?: string;
  option2?: number;
}

export function MyDecorator(config?: MyDecoratorConfig) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    // Inicializar array se não existe
    if (!target[MY_METADATA_KEY]) {
      target[MY_METADATA_KEY] = [];
    }

    // Salvar metadata
    target[MY_METADATA_KEY].push({
      methodName: propertyKey,
      method: descriptor.value,
      config: config || {},
    });

    return descriptor;
  };
}
```

### Passo 3: Criar Plugin Class

O plugin **lê metadata** e **executa lógica**:

```typescript
// plugin.ts
import { DecoratorPlugin, Component, HookContext, LifecyclePhase } from '@mini/core';
import { MY_METADATA_KEY } from './constants';
import type { MyDecoratorConfig } from './decorator';

interface MyMetadata {
  methodName: string;
  method: Function;
  config: MyDecoratorConfig;
}

export class MyDecoratorPlugin extends DecoratorPlugin {
  // Identificador único
  readonly id = "my-decorator-plugin";

  // Priority: menor número = executa primeiro
  // 0-50: Sistema
  // 50-100: Framework decorators (@Watch, @Mount)
  // 100+: User plugins
  readonly priority = 150;

  // Qual lifecycle phase executar
  readonly phase = LifecyclePhase.AfterMount;

  execute(component: Component, context: HookContext): void {
    // 1. Ler metadata
    const metadata = this.getMetadata<MyMetadata[]>(
      component,
      MY_METADATA_KEY
    );

    // 2. Validar
    if (!metadata || metadata.length === 0) {
      return;
    }

    // 3. Executar lógica para cada método decorado
    for (const item of metadata) {
      try {
        // Sua lógica aqui
        console.log(`Executing ${item.methodName}...`);

        // Chamar método decorado se necessário
        const result = item.method.call(component);

        // Se retorna cleanup, registrar
        if (typeof result === 'function') {
          this.registerCleanup(component, result);
        }
      } catch (error) {
        console.error(
          `[MyPlugin] Error in ${item.methodName}:`,
          error
        );
        component.emitError(error as Error);
      }
    }
  }
}
```

### Passo 4: Registrar Plugin

```typescript
// index.ts
import { lifecycleManager } from '@mini/core';
import { MyDecoratorPlugin } from './plugin';

// Exportar decorator para uso
export { MyDecorator } from './decorator';
export type { MyDecoratorConfig } from './decorator';

// Registrar plugin automaticamente
lifecycleManager.registerHook(new MyDecoratorPlugin());
```

### Passo 5: Usar!

```typescript
import { Component } from '@mini/core';
import { MyDecorator } from './my-plugin';

class MyComponent extends Component {
  @MyDecorator({ option1: 'value' })
  myMethod() {
    console.log('My method called!');
  }
}
```

---

## 💡 Exemplos Práticos

### Exemplo 1: Logger Plugin

Loga quando métodos são chamados:

```typescript
// logger/constants.ts
export const LOGGER_KEY = Symbol('logger:methods');

// logger/types.ts
export interface LoggerConfig {
  level?: 'info' | 'warn' | 'error';
  prefix?: string;
}

// logger/decorator.ts
import { LOGGER_KEY } from './constants';
import type { LoggerConfig } from './types';

export function Log(config?: LoggerConfig) {
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    if (!target[LOGGER_KEY]) {
      target[LOGGER_KEY] = [];
    }

    target[LOGGER_KEY].push({
      methodName: key,
      originalMethod: descriptor.value,
      config: config || { level: 'info' },
    });

    return descriptor;
  };
}

// logger/plugin.ts
import { DecoratorPlugin, Component, LifecyclePhase } from '@mini/core';
import { LOGGER_KEY } from './constants';

export class LoggerPlugin extends DecoratorPlugin {
  readonly id = "logger-plugin";
  readonly priority = 200;
  readonly phase = LifecyclePhase.AfterMount;

  execute(component: Component): void {
    const loggers = this.getMetadata(component, LOGGER_KEY);
    if (!loggers) return;

    for (const logger of loggers) {
      const { methodName, config } = logger;
      const level = config.level || 'info';
      const prefix = config.prefix || component.constructor.name;

      console[level](`[${prefix}] Method ${methodName} registered`);
    }
  }
}

// Uso:
class MyComponent extends Component {
  @Log({ level: 'info', prefix: 'MyComponent' })
  @Mount()
  onMount() {
    console.log('Mounted!');
  }
}
```

### Exemplo 2: Debounce Plugin

Adiciona debounce a métodos:

```typescript
// debounce/constants.ts
export const DEBOUNCE_KEY = Symbol('debounce:methods');

// debounce/decorator.ts
import { DEBOUNCE_KEY } from './constants';

export function Debounce(ms: number = 300) {
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;

    if (!target[DEBOUNCE_KEY]) {
      target[DEBOUNCE_KEY] = [];
    }

    target[DEBOUNCE_KEY].push({
      methodName: key,
      originalMethod: original,
      delayMs: ms,
    });

    return descriptor;
  };
}

// debounce/plugin.ts
import { DecoratorPlugin, Component, LifecyclePhase } from '@mini/core';
import { DEBOUNCE_KEY } from './constants';

export class DebouncePlugin extends DecoratorPlugin {
  readonly id = "debounce-plugin";
  readonly priority = 180;
  readonly phase = LifecyclePhase.AfterMount;

  execute(component: Component): void {
    const debouncers = this.getMetadata(component, DEBOUNCE_KEY);
    if (!debouncers) return;

    for (const debouncer of debouncers) {
      const { methodName, originalMethod, delayMs } = debouncer;
      let timeoutId: NodeJS.Timeout;

      // Substituir método por versão debounced
      (component as any)[methodName] = (...args: any[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          originalMethod.apply(component, args);
        }, delayMs);
      };

      // Registrar cleanup
      this.registerCleanup(component, () => {
        clearTimeout(timeoutId);
      });
    }
  }
}

// Uso:
class SearchComponent extends Component {
  @Debounce(500)
  onSearchInput(value: string) {
    console.log('Searching for:', value);
    // API call...
  }
}
```

### Exemplo 3: Throttle Plugin

Limita frequência de execução:

```typescript
// throttle/decorator.ts
export const THROTTLE_KEY = Symbol('throttle:methods');

export function Throttle(ms: number = 300) {
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    if (!target[THROTTLE_KEY]) {
      target[THROTTLE_KEY] = [];
    }

    target[THROTTLE_KEY].push({
      methodName: key,
      originalMethod: descriptor.value,
      delayMs: ms,
    });

    return descriptor;
  };
}

// throttle/plugin.ts
import { DecoratorPlugin, Component, LifecyclePhase } from '@mini/core';
import { THROTTLE_KEY } from './decorator';

export class ThrottlePlugin extends DecoratorPlugin {
  readonly id = "throttle-plugin";
  readonly priority = 190;
  readonly phase = LifecyclePhase.AfterMount;

  execute(component: Component): void {
    const throttlers = this.getMetadata(component, THROTTLE_KEY);
    if (!throttlers) return;

    for (const throttler of throttlers) {
      const { methodName, originalMethod, delayMs } = throttler;
      let lastCall = 0;

      (component as any)[methodName] = (...args: any[]) => {
        const now = Date.now();
        if (now - lastCall >= delayMs) {
          lastCall = now;
          return originalMethod.apply(component, args);
        }
      };
    }
  }
}

// Uso:
class ScrollComponent extends Component {
  @Throttle(100)
  onScroll(event: Event) {
    console.log('Scroll position:', window.scrollY);
  }
}
```

### Exemplo 4: Memoize Plugin

Cache de resultados:

```typescript
// memoize/decorator.ts
export const MEMOIZE_KEY = Symbol('memoize:methods');

export function Memoize() {
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    if (!target[MEMOIZE_KEY]) {
      target[MEMOIZE_KEY] = [];
    }

    target[MEMOIZE_KEY].push({
      methodName: key,
      originalMethod: descriptor.value,
    });

    return descriptor;
  };
}

// memoize/plugin.ts
import { DecoratorPlugin, Component, LifecyclePhase } from '@mini/core';
import { MEMOIZE_KEY } from './decorator';

export class MemoizePlugin extends DecoratorPlugin {
  readonly id = "memoize-plugin";
  readonly priority = 170;
  readonly phase = LifecyclePhase.AfterMount;

  execute(component: Component): void {
    const memoizers = this.getMetadata(component, MEMOIZE_KEY);
    if (!memoizers) return;

    for (const memoizer of memoizers) {
      const { methodName, originalMethod } = memoizer;
      const cache = new Map<string, any>();

      (component as any)[methodName] = (...args: any[]) => {
        const key = JSON.stringify(args);

        if (cache.has(key)) {
          return cache.get(key);
        }

        const result = originalMethod.apply(component, args);
        cache.set(key, result);
        return result;
      };

      // Cleanup cache
      this.registerCleanup(component, () => {
        cache.clear();
      });
    }
  }
}

// Uso:
class ExpensiveComponent extends Component {
  @Memoize()
  calculateSomethingExpensive(input: number): number {
    console.log('Calculating...');
    // Expensive computation
    return input * input;
  }
}
```

---

## ✅ Boas Práticas

### 1. Use Symbols para Metadata Keys

```typescript
// ❌ Ruim - pode ter colisão
const MY_KEY = 'my-metadata';

// ✅ Bom - único
const MY_KEY = Symbol('my-plugin:metadata');
```

### 2. Valide Metadata

```typescript
execute(component: Component): void {
  const metadata = this.getMetadata(component, MY_KEY);

  // ✅ Sempre valide
  if (!metadata || metadata.length === 0) {
    return;
  }

  // Continue...
}
```

### 3. Error Handling

```typescript
execute(component: Component): void {
  const metadata = this.getMetadata(component, MY_KEY);

  for (const item of metadata) {
    try {
      // Sua lógica
    } catch (error) {
      console.error(`[MyPlugin] Error:`, error);

      // ✅ Emita erro para o component
      component.emitError(error as Error);

      // ✅ Não pare - deixe outros plugins executarem
      continue;
    }
  }
}
```

### 4. Registre Cleanup

```typescript
execute(component: Component): void {
  const timer = setInterval(() => {
    // do work
  }, 1000);

  // ✅ Sempre registre cleanup
  this.registerCleanup(component, () => {
    clearInterval(timer);
  });
}
```

### 5. Type Safety

```typescript
// ✅ Defina interfaces
interface MyMetadata {
  methodName: string;
  method: Function;
  config: MyConfig;
}

// ✅ Use tipagem genérica
const metadata = this.getMetadata<MyMetadata[]>(
  component,
  MY_KEY
);
```

### 6. Escolha Priority Correta

```typescript
// Priorities:
// 0-49:   Sistema interno
// 50:     @Watch (setup subscriptions)
// 100:    @Mount (lifecycle callbacks)
// 150+:   User plugins

// Se seu plugin depende de @Watch/@Mount:
readonly priority = 150;  // ✅ Executa DEPOIS

// Se seu plugin precisa executar antes:
readonly priority = 75;   // ✅ Executa ENTRE @Watch e @Mount
```

---

## 🐛 Troubleshooting

### Plugin Não Executa

**Problema**: Plugin registrado mas não executa.

**Checklist**:
1. ✅ Plugin foi registrado? `lifecycleManager.registerHook(plugin)`
2. ✅ Phase está correto? Provavelmente `LifecyclePhase.AfterMount`
3. ✅ Decorator está salvando metadata? Console.log a metadata key
4. ✅ Plugin está lendo metadata correta? Mesma key do decorator

**Debug**:
```typescript
// Ver plugins registrados
console.log(lifecycleManager.getHooks());

// Ver metadata salva
console.log(component.constructor.prototype[MY_KEY]);
```

### Metadata Undefined

**Problema**: `getMetadata` retorna `undefined`.

**Solução**: Certifique-se que decorator e plugin usam a **mesma key**:

```typescript
// decorator.ts
export const MY_KEY = Symbol('my-key');

target[MY_KEY].push(data);

// plugin.ts
import { MY_KEY } from './decorator';  // ✅ Importar!

const data = this.getMetadata(component, MY_KEY);
```

### Plugin Executa Múltiplas Vezes

**Problema**: Plugin executando mais de uma vez.

**Causa**: Component sendo re-renderizado.

**Solução**: Framework já previne isso automaticamente. Se ainda acontece:

```typescript
// Adicione flag
const EXECUTED_KEY = Symbol('my-plugin:executed');

execute(component: Component): void {
  if ((component as any)[EXECUTED_KEY]) {
    return;  // ✅ Já executou
  }
  (component as any)[EXECUTED_KEY] = true;

  // Sua lógica...
}
```

### Cleanup Não Executando

**Problema**: Cleanup não é chamado no unmount.

**Solução**: Use `registerCleanup` do plugin:

```typescript
// ❌ Ruim
component.$.unmount$.subscribe(() => {
  cleanup();
});

// ✅ Bom
this.registerCleanup(component, () => {
  cleanup();
});
```

---

## 🎯 Checklist de Plugin

Antes de publicar seu plugin, verifique:

- [ ] ✅ Metadata key é `Symbol`
- [ ] ✅ Decorator salva metadata corretamente
- [ ] ✅ Plugin lê mesma metadata key
- [ ] ✅ Error handling implementado
- [ ] ✅ Cleanup registrado se necessário
- [ ] ✅ Types/interfaces definidos
- [ ] ✅ Priority escolhida corretamente
- [ ] ✅ Documentação criada
- [ ] ✅ Exemplos de uso incluídos
- [ ] ✅ Testes escritos

---

## 📚 Recursos

- **ARCHITECTURE.md**: Visão geral da arquitetura
- **Código dos Plugins Built-in**:
  - `packages/core/src/decorators/Watch/WatchPlugin.ts`
  - `packages/core/src/decorators/Mount/MountPlugin.ts`
- **Exemplos**: `examples/playground/`

---

## 🎉 Conclusão

Criar plugins no Mini Framework é simples e poderoso:

1. ✅ **Decorator** salva metadata
2. ✅ **Plugin** lê metadata e executa
3. ✅ **Registration** ativa o plugin

Com o sistema de plugins, você pode estender o framework infinitamente sem modificar o core!

**Happy Plugin Development!** 🚀
