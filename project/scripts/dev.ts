import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

type Spawned = {
  name: string;
  proc: ReturnType<typeof Bun.spawn>;
};

function spawnWorkspaceScript(workspaceName: string, scriptName: string): Spawned {
  const scriptsDir = dirname(fileURLToPath(import.meta.url));
  const projectRoot = join(scriptsDir, '..');
  const workspaceDir = join(projectRoot, workspaceName);

  const proc = Bun.spawn(['bun', 'run', scriptName], {
    cwd: workspaceDir,
    stdout: 'inherit',
    stderr: 'inherit',
  });

  return { name: workspaceName, proc };
}

const children = [spawnWorkspaceScript('server', 'dev'), spawnWorkspaceScript('client', 'dev')];

const exitCodes = await Promise.all(
  children.map(async (child) => ({
    name: child.name,
    exitCode: await child.proc.exited,
  })),
);

const failing = exitCodes.find((result) => result.exitCode !== 0);
if (failing) {
  console.error(`Workspace '${failing.name}' exited with code ${failing.exitCode}`);
  process.exit(failing.exitCode);
}
