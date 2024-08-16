import * as vscode from 'vscode';
import { registerCommand } from '../utilities/register-command';
import { html, render } from '../utilities/html';

let currentPanel: vscode.WebviewPanel | undefined = undefined;

const content = html`<h1>Start Workflow</h1>`;

export const startWorkflow = registerCommand(
  'startWorkflow',
  async ({ context }) => {
    const columnToShowIn = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (currentPanel) {
      currentPanel.reveal(columnToShowIn);
      return;
    } else {
      currentPanel = vscode.window.createWebviewPanel(
        'startWorkflow',
        'Temporal: Start Workflow',
        columnToShowIn || vscode.ViewColumn.One,
        {},
      );

      currentPanel.webview.html = render(content);

      currentPanel.onDidDispose(
        () => (currentPanel = undefined),
        null,
        context.subscriptions,
      );
    }
  },
);
