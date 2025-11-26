# MiniJS MCP Server

> MCP server para documentação e assistência do MiniJS Framework

Este MCP server fornece documentação completa do MiniJS Framework e ferramentas úteis para gerar código seguindo as melhores práticas.

## 🚀 Instalação

### Opção 1: Via NPM (Recomendado)

```bash
# Instalar globalmente
npm install -g @mini/mcp-server

# Ou instalar localmente no projeto
npm install @mini/mcp-server
```

### Opção 2: Instalação Local (Desenvolvimento)

```bash
cd mcp-server-minijs
npm install
npm run build
```

## 📦 Como Usar

### Opção 1: Com NPM (Mais Fácil)

Adicione ao arquivo de configuração do Claude Desktop:

```json
{
  "mcpServers": {
    "minijs": {
      "command": "npx",
      "args": ["@mini/mcp-server"]
    }
  }
}
```

### Opção 2: Com Claude Desktop / Cline (Instalação Local)

1. **Localize o arquivo de configuração:**

   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

2. **Adicione a configuração do servidor:**

```json
{
  "mcpServers": {
    "minijs": {
      "command": "node",
      "args": ["/caminho/absoluto/para/mcp-server-minijs/dist/index.js"]
    }
  }
}
```

**IMPORTANTE:** Use o caminho absoluto completo para o arquivo `dist/index.js`.

3. **Reinicie o Claude Desktop**

4. **Verifique se está funcionando:**
   - Abra o Claude Desktop
   - Procure por um ícone de ferramentas ou recursos MCP
   - Você deve ver "minijs" listado nos servidores conectados

### Opção 2: Executar Manualmente (para testes)

```bash
cd mcp-server-minijs
node dist/index.js
```

## 📚 Resources Disponíveis

O servidor expõe 18 resources de documentação organizados por categorias:

### Core Concepts (3 resources)
- `minijs://core/overview` - Visão geral do framework
- `minijs://core/installation` - Instalação e setup
- `minijs://core/component-basics` - Fundamentos de componentes

### Signals (1 resource)
- `minijs://signals/overview` - API completa de Signals (map, filter, reduce, orElse, get, promise-like)

### Decorators (1 resource)
- `minijs://decorators/all` - Referência completa de todos decorators (@Mount, @Watch, @Injectable, etc)

### Project Structure (5 resources)
- `minijs://structure/overview` - Estrutura de projeto recomendada
- `minijs://structure/naming` - Convenções de nomenclatura
- `minijs://structure/repository` - Pattern de repositories
- `minijs://structure/feature` - Estrutura de features
- `minijs://structure/routing` - Rotas e Route Groups

### Outros (8 resources)
- `minijs://components/basics` - Guia de componentes
- `minijs://di/overview` - Sistema DI hierárquico
- `minijs://routing/overview` - Sistema de rotas, Guards e Resolvers
- `minijs://best-practices/overview` - Melhores práticas

## 🛠️ Tools Disponíveis

O servidor fornece 5 tools para gerar código:

### 1. generate_component
Gera template de um componente MiniJS.

**Exemplo de uso no Claude/Cline:**
> "Gere um componente UserCard com props, state e hook de mount"

**Parâmetros:**
```typescript
{
  "name": "UserCard",        // required - PascalCase
  "withProps": true,         // optional - incluir interface de props
  "withState": true,         // optional - incluir signals de estado
  "withMount": true          // optional - incluir @Mount() hook
}
```

### 2. generate_service
Gera template de um service com Dependency Injection.

**Exemplo de uso:**
> "Crie um UserService que injeta UserRepository"

**Parâmetros:**
```typescript
{
  "name": "UserService",     // required - PascalCase
  "withRepository": true     // optional - incluir injeção de repository
}
```

### 3. generate_repository
Gera template completo de repository (todos os arquivos).

**Exemplo de uso:**
> "Crie um repository completo para User"

**Parâmetros:**
```typescript
{
  "name": "User",            // required - PascalCase
  "baseUrl": "/api/v1"       // optional - base URL da API
}
```

**Gera 4 arquivos:**
- `User.repository.ts` - Classe do repository
- `constants.ts` - Endpoints da API
- `types.ts` - Interfaces TypeScript
- `index.ts` - Exports

### 4. generate_page
Gera template de uma página com rota.

**Exemplo de uso:**
> "Crie uma página ProductDetail na rota /products/:id com guards e resolvers"

**Parâmetros:**
```typescript
{
  "name": "ProductDetail",   // required - PascalCase
  "route": "/products/:id",  // required - path da rota
  "withGuards": true,        // optional - incluir guards de autenticação
  "withResolvers": true      // optional - incluir resolvers para pré-carregamento
}
```

### 5. validate_naming
Valida convenções de nomenclatura de arquivos e classes.

**Exemplo de uso:**
> "Valide se Login.page.tsx com classe Login está correto"

**Parâmetros:**
```typescript
{
  "filename": "Login.page.tsx",  // required
  "className": "Login"           // required
}
```

## 💡 Exemplos de Prompts

Aqui estão alguns exemplos de como usar o MCP server com IAs:

### Criar um componente simples
```
Crie um componente Button com props
```

### Criar um componente completo
```
Crie um componente UserCard que:
- Receba props de usuário
- Tenha state para loading
- Use @Mount() para buscar dados
```

### Criar um repository completo
```
Crie um repository completo para Product com base URL /api/v1
```

### Criar uma feature completa
```
Crie uma feature de produtos com:
- ProductRepository
- ProductService que usa o repository
- Página de listagem em /products
- Página de detalhe em /products/:id com guards
```

### Validar nomenclatura
```
Valide se UserService.service.ts com classe UserService está correto
```

## 🎯 O que as IAs Aprendem

Com este MCP server, IAs podem:

1. ✅ **Reatividade Granular** - Como usar Signals com RxJS
2. ✅ **Estrutura de Projeto** - Repositories, Features, Route Groups
3. ✅ **Convenções de Nomenclatura** - PascalCase, suffixes, etc
4. ✅ **Decorators** - @Mount, @Watch, @Injectable, @Route, etc
5. ✅ **Dependency Injection** - Sistema DI hierárquico
6. ✅ **Best Practices** - Separação de responsabilidades
7. ✅ **Signal API** - map, filter, reduce, orElse, get, promise-like
8. ✅ **Guards & Resolvers** - Proteção e pré-carregamento de rotas

## 🔧 Desenvolvimento

```bash
# Instalar dependências
npm install

# Compilar TypeScript
npm run build

# Watch mode (desenvolvimento)
npm run dev
```

## 📁 Estrutura do Projeto

```
mcp-server-minijs/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts              # Entry point do servidor
│   ├── types.ts              # Tipos TypeScript
│   ├── resources/            # Documentação do framework
│   │   ├── index.ts
│   │   ├── core-concepts.ts
│   │   ├── signals.ts
│   │   ├── decorators.ts
│   │   ├── project-structure.ts
│   │   ├── components.ts
│   │   ├── dependency-injection.ts
│   │   ├── routing.ts
│   │   └── best-practices.ts
│   └── tools/               # Geradores de código
│       └── index.ts
└── dist/                    # Arquivos compilados
    └── index.js
```

## 🐛 Troubleshooting

### O servidor não aparece no Claude Desktop

1. Verifique se o caminho no config está correto (use caminho absoluto)
2. Certifique-se de que compilou o projeto (`npm run build`)
3. Reinicie o Claude Desktop completamente
4. Verifique os logs do Claude Desktop

### Erro ao compilar

```bash
# Limpe e reinstale as dependências
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Testar se o servidor está funcionando

```bash
# Execute manualmente
cd mcp-server-minijs
node dist/index.js

# Deve exibir: "MiniJS MCP Server running on stdio"
```

## 📄 Licença

MIT © MiniJS Team

## 🤝 Contribuindo

Contribuições são bem-vindas! Este MCP server evolui junto com o framework MiniJS.

Para adicionar novos resources ou tools:

1. Adicione o resource em `src/resources/`
2. Ou adicione o tool em `src/tools/index.ts`
3. Compile com `npm run build`
4. Teste com o Claude Desktop

## 📞 Suporte

Se tiver problemas ou dúvidas:
- Abra uma issue no repositório do MiniJS
- Consulte a documentação do MCP SDK
- Verifique os exemplos de uso neste README
