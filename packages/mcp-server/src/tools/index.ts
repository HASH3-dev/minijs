import { Tool, ToolResult } from "../types";

export const tools: Tool[] = [
  {
    name: "generate_component",
    description: "Gera template de um componente MiniJS",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Nome do componente em PascalCase (ex: UserCard)",
        },
        withProps: {
          type: "boolean",
          description: "Incluir interface de props",
        },
        withState: {
          type: "boolean",
          description: "Incluir signals de estado",
        },
        withMount: {
          type: "boolean",
          description: "Incluir @Mount() hook",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "generate_service",
    description: "Gera template de um service com DI",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Nome do service em PascalCase (ex: UserService)",
        },
        withRepository: {
          type: "boolean",
          description: "Incluir injeção de repository",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "generate_repository",
    description: "Gera template completo de repository",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Nome do repository em PascalCase (ex: User)",
        },
        baseUrl: {
          type: "string",
          description: "Base URL da API (ex: /api/v1)",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "generate_page",
    description: "Gera template de uma página com rota",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Nome da página em PascalCase (ex: ProductDetail)",
        },
        route: {
          type: "string",
          description: "Path da rota (ex: /products/:id)",
        },
        withGuards: {
          type: "boolean",
          description: "Incluir guards de autenticação",
        },
        withResolvers: {
          type: "boolean",
          description: "Incluir resolvers para pré-carregamento",
        },
      },
      required: ["name", "route"],
    },
  },
  {
    name: "validate_naming",
    description: "Valida convenções de nomenclatura de arquivos e classes",
    inputSchema: {
      type: "object",
      properties: {
        filename: {
          type: "string",
          description: "Nome do arquivo (ex: Login.page.tsx)",
        },
        className: {
          type: "string",
          description: "Nome da classe (ex: Login)",
        },
      },
      required: ["filename", "className"],
    },
  },
];

export async function handleToolCall(
  name: string,
  args: any
): Promise<ToolResult> {
  switch (name) {
    case "generate_component":
      return generateComponent(args);
    case "generate_service":
      return generateService(args);
    case "generate_repository":
      return generateRepository(args);
    case "generate_page":
      return generatePage(args);
    case "validate_naming":
      return validateNaming(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function generateComponent(args: {
  name: string;
  withProps?: boolean;
  withState?: boolean;
  withMount?: boolean;
}): ToolResult {
  const { name, withProps, withState, withMount } = args;

  const imports = ["Component"];
  if (withState) imports.push("signal");
  if (withMount) imports.push("Mount");

  const propsInterface = withProps
    ? `interface ${name}Props {
  // Defina suas props aqui
}

`
    : "";

  const stateSection = withState
    ? `  // State
  data = signal<any>(null);

`
    : "";

  const mountSection = withMount
    ? `  @Mount()
  onMount() {
    console.log('${name} mounted');

    // Cleanup (opcional)
    return () => {
      console.log('${name} unmounting');
    };
  }

`
    : "";

  const code = `import { ${imports.join(", ")} } from '@mini/core';

${propsInterface}export class ${name} extends Component${
    withProps ? `<${name}Props>` : ""
  } {
${stateSection}${mountSection}  render() {
    return (
      <div className="${name.toLowerCase()}">
        <h1>${name}</h1>
      </div>
    );
  }
}
`;

  return {
    content: [
      {
        type: "text",
        text: `Arquivo: ${name}.component.tsx\n\n\`\`\`typescript\n${code}\`\`\``,
      },
    ],
  };
}

function generateService(args: {
  name: string;
  withRepository?: boolean;
}): ToolResult {
  const { name, withRepository } = args;
  const serviceName = name.endsWith("Service") ? name : `${name}Service`;
  const repoName = name.replace("Service", "Repository");
  const repoPath = name.toLowerCase().replace("service", "");

  const imports = ["Injectable"];
  if (withRepository) imports.push("Inject");

  const repoImport = withRepository
    ? `import { ${repoName} } from '@/repositories/${repoPath}';\n`
    : "";

  const repoInjection = withRepository
    ? `  @Inject(${repoName}) private repository!: ${repoName};

`
    : "";

  const getDataBody = withRepository
    ? `    const data = await this.repository.findAll();
    return this.applyBusinessLogic(data);`
    : `    // Implementar lógica de negócio
    return [];`;

  const businessLogicMethod = withRepository
    ? `

  private applyBusinessLogic(data: any[]) {
    // Aplicar regras de negócio
    return data;
  }`
    : "";

  const code = `import { ${imports.join(", ")} } from '@mini/core';
${repoImport}
@Injectable()
export class ${serviceName} {
${repoInjection}  async getData() {
${getDataBody}
  }${businessLogicMethod}
}
`;

  return {
    content: [
      {
        type: "text",
        text: `Arquivo: ${name}.service.ts\n\n\`\`\`typescript\n${code}\`\`\``,
      },
    ],
  };
}

function generateRepository(args: {
  name: string;
  baseUrl?: string;
}): ToolResult {
  const { name, baseUrl = "/api/v1" } = args;
  const repoName = `${name}Repository`;
  const typeName = name;
  const endpoint = name.toLowerCase() + "s";
  const endpointUpper = endpoint.toUpperCase();

  const result = `# Repository: ${name}

## ${name}.repository.ts
\`\`\`typescript
import { Injectable } from '@mini/core';
import { API_ENDPOINTS } from './constants';
import { ${typeName}, Create${typeName}Dto } from './types';

@Injectable()
export class ${repoName} {
  async findAll(): Promise<${typeName}[]> {
    const response = await fetch(API_ENDPOINTS.${endpointUpper});
    return response.json();
  }

  async findById(id: string): Promise<${typeName}> {
    const response = await fetch(\`\${API_ENDPOINTS.${endpointUpper}}/\${id}\`);
    return response.json();
  }

  async create(dto: Create${typeName}Dto): Promise<${typeName}> {
    const response = await fetch(API_ENDPOINTS.${endpointUpper}, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    return response.json();
  }
}
\`\`\`

## constants.ts
\`\`\`typescript
const BASE_URL = '${baseUrl}';

export const API_ENDPOINTS = {
  ${endpointUpper}: \`\${BASE_URL}/${endpoint}\`,
} as const;
\`\`\`

## types.ts
\`\`\`typescript
export interface ${typeName} {
  id: string;
  // Adicione campos aqui
  createdAt: Date;
}

export interface Create${typeName}Dto {
  // Campos para criação
}
\`\`\`

## index.ts
\`\`\`typescript
export { ${repoName} } from './${name}.repository';
export type { ${typeName}, Create${typeName}Dto } from './types';
export { API_ENDPOINTS } from './constants';
\`\`\`
`;

  return {
    content: [{ type: "text", text: result }],
  };
}

function generatePage(args: {
  name: string;
  route: string;
  withGuards?: boolean;
  withResolvers?: boolean;
}): ToolResult {
  const { name, route, withGuards, withResolvers } = args;

  const imports = ["Component", "Route"];
  if (withGuards) imports.push("UseGuards");
  if (withResolvers) imports.push("UseResolvers", "Inject", "Signal");

  const additionalImports: string[] = [];
  if (withGuards)
    additionalImports.push("import { AuthGuard } from '@/shared/guards';");
  if (withResolvers)
    additionalImports.push("import { DataResolver } from './resolvers';");

  const decorators: string[] = [`@Route('${route}')`];
  if (withGuards) decorators.push("@UseGuards([AuthGuard])");
  if (withResolvers) decorators.push("@UseResolvers([DataResolver])");

  const dataInjection = withResolvers
    ? `  @Inject(DataResolver) data!: Signal<any>;

`
    : "";

  const code = `import { ${imports.join(", ")} } from '@mini/core';
${additionalImports.length > 0 ? additionalImports.join("\n") + "\n" : ""}
${decorators.join("\n")}
export class ${name} extends Component {
${dataInjection}  render() {
    return (
      <div className="${name.toLowerCase()}">
        <h1>${name}</h1>
      </div>
    );
  }
}
`;

  return {
    content: [
      {
        type: "text",
        text: `Arquivo: ${name}.page.tsx\n\n\`\`\`typescript\n${code}\`\`\``,
      },
    ],
  };
}

function validateNaming(args: {
  filename: string;
  className: string;
}): ToolResult {
  const { filename, className } = args;
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validar formato do arquivo
  const filePatterns = {
    page: /^[A-Z][a-zA-Z0-9]*\.page\.tsx$/,
    component: /^[A-Z][a-zA-Z0-9]*\.component\.tsx$/,
    service: /^[A-Z][a-zA-Z0-9]*\.service\.ts$/,
    repository: /^[A-Z][a-zA-Z0-9]*\.repository\.ts$/,
    guard: /^[A-Z][a-zA-Z0-9]*\.guard\.ts$/,
    resolver: /^[A-Z][a-zA-Z0-9]*\.resolver\.ts$/,
  };

  let matchedType: string | null = null;
  for (const [type, pattern] of Object.entries(filePatterns)) {
    if (pattern.test(filename)) {
      matchedType = type;
      break;
    }
  }

  if (!matchedType) {
    errors.push(
      `Nome de arquivo inválido. Use formato: PascalCase.{page|component|service|repository|guard|resolver}.{tsx|ts}`
    );
  }

  // Validar nome da classe
  if (!/^[A-Z][a-zA-Z0-9]*$/.test(className)) {
    errors.push(`Nome de classe deve ser PascalCase: ${className}`);
  }

  // Validar correspondência entre arquivo e classe
  const baseName = filename.split(".")[0];
  if (matchedType && baseName !== className) {
    errors.push(
      `Nome do arquivo (${baseName}) deve corresponder ao nome da classe (${className})`
    );
  }

  // Validar sufixos de classe
  if (matchedType === "service" && !className.endsWith("Service")) {
    warnings.push(`Services devem ter sufixo 'Service': ${className}Service`);
  }
  if (matchedType === "repository" && !className.endsWith("Repository")) {
    warnings.push(
      `Repositories devem ter sufixo 'Repository': ${className}Repository`
    );
  }
  if (matchedType === "guard" && !className.endsWith("Guard")) {
    warnings.push(`Guards devem ter sufixo 'Guard': ${className}Guard`);
  }
  if (matchedType === "resolver" && !className.endsWith("Resolver")) {
    warnings.push(
      `Resolvers devem ter sufixo 'Resolver': ${className}Resolver`
    );
  }

  const errorsSection =
    errors.length > 0
      ? `## ❌ Erros

${errors.map((err) => `- ${err}`).join("\n")}

`
      : "";

  const warningsSection =
    warnings.length > 0
      ? `## ⚠️ Avisos

${warnings.map((warn) => `- ${warn}`).join("\n")}`
      : "";

  const statusMessage =
    errors.length === 0 && warnings.length === 0
      ? `✅ **Validação OK!** Nomenclatura está correta.\n`
      : "";

  const result = `# Validação de Nomenclatura

**Arquivo:** ${filename}
**Classe:** ${className}
**Tipo:** ${matchedType || "desconhecido"}

${statusMessage}${errorsSection}${warningsSection}`;

  return {
    content: [{ type: "text", text: result }],
  };
}
