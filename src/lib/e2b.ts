import { Sandbox } from '@e2b/code-interpreter';

export interface E2BSandboxConfig {
  apiKey: string;
  timeout?: number; // in milliseconds
}

export class E2BClient {
  private apiKey: string;
  private defaultTimeout: number;

  constructor(config: E2BSandboxConfig) {
    this.apiKey = config.apiKey;
    this.defaultTimeout = config.timeout || 60 * 60 * 1000; // 1 hour default
  }

  async createNextJsSandbox(): Promise<Sandbox> {
    const sandbox = await Sandbox.create({
      apiKey: this.apiKey,
      timeoutMs: this.defaultTimeout,
    });

    // Install Next.js and dependencies
    await sandbox.commands.run(
      'npx create-next-app@latest my-app --typescript --tailwind --app --import-alias "@/*" --use-npm --no-git --yes'
    );

    // Navigate to the project directory
    await sandbox.commands.run('cd my-app');

    return sandbox;
  }

  async startDevServer(sandbox: Sandbox): Promise<{ url: string; port: number }> {
    // Start Next.js dev server in background
    const process = await sandbox.commands.run(
      'cd my-app && npm run dev',
      {
        background: true,
      }
    );

    // Wait for the server to be ready (check for "ready" message)
    await new Promise((resolve) => setTimeout(resolve, 10000));

    // Get the sandbox URL
    const port = 3000;
    const url = `https://${sandbox.getHost(port)}`;

    return { url, port };
  }

  async readFile(sandbox: Sandbox, filePath: string): Promise<string> {
    const result = await sandbox.files.read(filePath);
    return result;
  }

  async writeFile(
    sandbox: Sandbox,
    filePath: string,
    content: string
  ): Promise<void> {
    await sandbox.files.write(filePath, content);
  }

  async listFiles(sandbox: Sandbox, dirPath: string = 'my-app'): Promise<any[]> {
    const result = await sandbox.files.list(dirPath);
    return result;
  }

  async createFile(sandbox: Sandbox, filePath: string, content: string = ''): Promise<void> {
    await sandbox.files.write(filePath, content);
  }

  async deleteFile(sandbox: Sandbox, filePath: string): Promise<void> {
    await sandbox.commands.run(`rm -f ${filePath}`);
  }

  async createDirectory(sandbox: Sandbox, dirPath: string): Promise<void> {
    await sandbox.files.makeDir(dirPath);
  }

  async getSandboxById(sandboxId: string): Promise<Sandbox> {
    // Note: E2B API uses 'connect' to reconnect to existing sandboxes
    const sandbox = await Sandbox.create({
      apiKey: this.apiKey,
      sandboxId: sandboxId, // Pass existing sandbox ID to reconnect
    } as any);
    return sandbox;
  }

  async killSandbox(sandbox: Sandbox): Promise<void> {
    await sandbox.kill();
  }
}

export function getE2BClient(apiKey: string): E2BClient {
  return new E2BClient({ apiKey });
}
