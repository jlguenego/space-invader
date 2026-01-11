const [workspaceName, todoId, extra] = Bun.argv.slice(2);

const workspaceLabel = workspaceName ? `'${workspaceName}'` : 'This workspace';
const todoLabel = todoId ? `TODO ${todoId}` : 'the relevant TODO';

const detail = extra ? ` ${extra}` : '';

console.log(`${workspaceLabel} is not initialized yet. Run ${todoLabel}.${detail}`);
