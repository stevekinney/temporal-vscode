import * as vscode from 'vscode';

export const showTaskQueue = ({
  namespace,
  webUI,
}: {
  namespace: string;
  webUI: string;
}) =>
  vscode.commands.registerCommand('temporal-vscode.showTaskQueue', async () => {
    const taskQueue = await vscode.window.showInputBox({
      placeHolder: 'Enter task queue name',
    });

    if (!taskQueue) {
      return;
    }

    const url = `http://${webUI}/namespaces/${namespace}/task-queues/${taskQueue}`;

    vscode.env.openExternal(vscode.Uri.parse(url));
  });
