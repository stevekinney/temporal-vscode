import * as vscode from 'vscode';
import { Command } from '$components/command';

/**
 * @summary Show task queue
 */
Command.register('showTaskQueue', async ({ openUI }) => {
  try {
    const taskQueue = await vscode.window.showInputBox({
      placeHolder: 'Enter task queue name',
    });

    if (!taskQueue) {
      return;
    }

    openUI(`task-queues/${taskQueue}`);
  } catch (error) {
    vscode.window.showErrorMessage((error as Error).message);
  }
});
