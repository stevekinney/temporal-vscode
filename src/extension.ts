import * as vscode from 'vscode';

import { setContext } from '$components/component';
import { createChat } from './models';

export async function activate(context: vscode.ExtensionContext) {
  setContext(context);
  createChat(context);

  try {
    await Promise.all([
      import('./commands/workflows'),
      import('./commands/count-workflows'),
      import('./commands/task-queue'),
      import('./commands/schedules'),
      import('./commands/batch-operations'),
      import('./commands/start-workflow'),
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
