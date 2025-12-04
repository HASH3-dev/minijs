#!/usr/bin/env node

import * as p from "@clack/prompts";
import { Command } from "commander";
import { execa } from "execa";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import pc from "picocolors";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface ProjectConfig {
  name: string;
  includeRouter: boolean;
  includeTailwind: boolean;
  includeMCP: boolean;
  complexExample: boolean;
  packageManager: "npm" | "yarn" | "pnpm";
}

async function createProject(targetDir: string, config: ProjectConfig) {
  const spinner = p.spinner();

  try {
    // Create project directory
    spinner.start("Creating project structure...");
    await fs.ensureDir(targetDir);

    // Copy template files
    const templateDir = path.join(__dirname, "../templates/base");
    await fs.copy(templateDir, targetDir);

    // Update package.json with project name
    const packageJsonPath = path.join(targetDir, "package.json");
    const packageJson = await fs.readJson(packageJsonPath);
    packageJson.name = config.name;

    // Add router dependency if selected
    if (config.includeRouter) {
      packageJson.dependencies["@mini/router"] = "^0.1.0";
    }

    // Add Tailwind dependencies if selected
    if (config.includeTailwind) {
      packageJson.devDependencies["@tailwindcss/postcss"] = "^4.1.14";
      packageJson.devDependencies["autoprefixer"] = "^10.4.21";
      packageJson.devDependencies["postcss"] = "^8.5.6";
      packageJson.devDependencies["tailwindcss"] = "^4.1.14";

      // Copy Tailwind config files
      const tailwindTemplate = path.join(__dirname, "../templates/tailwind");
      await fs.copy(tailwindTemplate, targetDir, { overwrite: true });
    }

    // Add MCP Server if selected
    if (config.includeMCP) {
      packageJson.devDependencies["@mini/mcp-server"] = "^1.0.0";

      // Create MCP config file
      const mcpConfig = {
        mcpServers: {
          minijs: {
            command: "npx",
            args: ["@mini/mcp-server"],
          },
        },
      };

      const mcpConfigPath = path.join(targetDir, "mcp-config.json");
      await fs.writeJson(mcpConfigPath, mcpConfig, { spaces: 2 });
    }

    if (config.complexExample) {
      // Copy complex example files
      const complexTemplate = path.join(__dirname, "../templates/complex");
      await fs.copy(complexTemplate, targetDir, { overwrite: true });
    }

    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

    spinner.stop("Project structure created!");

    // Install dependencies
    spinner.start(`Installing dependencies with ${config.packageManager}...`);

    const installCommand =
      config.packageManager === "yarn"
        ? "yarn"
        : config.packageManager === "pnpm"
        ? "pnpm install"
        : "npm install";

    await execa(
      config.packageManager,
      config.packageManager === "yarn" ? [] : ["install"],
      {
        cwd: targetDir,
        stdio: "inherit",
      }
    );

    spinner.stop("Dependencies installed!");

    return true;
  } catch (error) {
    spinner.stop("Failed to create project");
    throw error;
  }
}

async function main() {
  console.clear();

  p.intro(pc.bgCyan(pc.black(" create-mini ")));

  const project = await p.group(
    {
      name: () =>
        p.text({
          message: "What is your project name?",
          placeholder: "my-mini-app",
          validate: (value) => {
            if (!value) return "Project name is required";
            if (!/^[a-z0-9-]+$/.test(value)) {
              return "Project name can only contain lowercase letters, numbers, and hyphens";
            }
          },
        }),
      includeRouter: () =>
        p.confirm({
          message: "Include @mini/router?",
          initialValue: true,
        }),
      includeTailwind: () =>
        p.confirm({
          message: "Include Tailwind CSS?",
          initialValue: true,
        }),
      includeMCP: () =>
        p.confirm({
          message: "Include MCP Server for AI assistance?",
          initialValue: false,
        }),
      complexExample: () =>
        p.confirm({
          message: "Include complex example features?",
          initialValue: false,
        }),
      packageManager: () =>
        p.select({
          message: "Select a package manager:",
          options: [
            { value: "npm", label: "npm" },
            { value: "yarn", label: "yarn" },
            { value: "pnpm", label: "pnpm" },
          ],
          initialValue: "npm",
        }),
    },
    {
      onCancel: () => {
        p.cancel("Operation cancelled.");
        process.exit(0);
      },
    }
  );

  const targetDir = path.join(process.cwd(), project.name as string);

  // Check if directory exists
  if (await fs.pathExists(targetDir)) {
    const shouldOverwrite = await p.confirm({
      message: `Directory ${project.name} already exists. Overwrite?`,
      initialValue: false,
    });

    if (!shouldOverwrite || p.isCancel(shouldOverwrite)) {
      p.cancel("Operation cancelled.");
      process.exit(0);
    }

    await fs.remove(targetDir);
  }

  try {
    await createProject(targetDir, project as ProjectConfig);

    const projectName = project.name as string;
    const devCommand =
      project.packageManager === "npm" ? "npm run" : project.packageManager;

    const mcpInfo = project.includeMCP
      ? `

🤖 MCP Server installed!
  To use with Claude Desktop, add mcp-config.json to your Claude config:
  ${pc.cyan("~/.config/Claude/claude_desktop_config.json")} (Linux)
  ${pc.cyan(
    "~/Library/Application Support/Claude/claude_desktop_config.json"
  )} (macOS)`
      : "";

    p.outro(
      pc.green(`
✨ Project ${pc.bold(projectName)} created successfully!

Next steps:
  cd ${projectName}
  ${devCommand} dev${mcpInfo}
`)
    );
  } catch (error) {
    p.cancel("Failed to create project");
    console.error(error);
    process.exit(1);
  }
}

const program = new Command();

program
  .name("create-mini")
  .description("Create a new Mini Framework project")
  .version("0.1.0")
  .action(main);

program.parse();
