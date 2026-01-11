import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

async function runWorkspace(workspaceName: string, scriptName: string) {
  const scriptsDir = dirname(fileURLToPath(import.meta.url));
  const projectRoot = join(scriptsDir, '..');
  const workspaceDir = join(projectRoot, workspaceName);

  const proc = Bun.spawn(['bun', 'run', scriptName], {
    cwd: workspaceDir,
    stdout: 'inherit',
    stderr: 'inherit',
  });

  const code = await proc.exited;
  if (code !== 0) {
    process.exit(code);
  }
}

await runWorkspace('server', 'build');
await runWorkspace('client', 'build');
