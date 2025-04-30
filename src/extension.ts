import * as vscode from 'vscode';

import { setContext } from '$components/component';

export async function activate(context: vscode.ExtensionContext) {
  setContext(context);

  try {
    await Promise.all([
      import('./commands/workflows'),
      import('./commands/count-workflows'),
      import('./commands/start-workflow'),
      import('./commands/task-queue'),
      import('./commands/schedules'),
      import('./commands/batch-operations'),
      import('./commands/search-attributes'),
      import('./commands/information'),
      import('./commands/settings'),
      import('./server'),
    ]);
  } catch (error) {
    vscode.window.showErrorMessage((error as Error).message);
  }
}

export function deactivate() {}
