import * as vscode from 'vscode';

import { Webview } from '$components/webview';
import { Terminal } from '$components/terminal';
import { Command } from '$components/command';

export async function activate(context: vscode.ExtensionContext) {
  Webview.context = context;
  Terminal.context = context;
  Command.context = context;

  console.log('Extension "temporal-vscode" is now active!');

  try {
    await Promise.all([
      import('./commands/workflows'),
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
