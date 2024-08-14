import * as vscode from 'vscode';
import { registerCommandWithoutClient } from '../utilities/register-command';

export const startDevelopmentServer = registerCommandWithoutClient(
  'startDevelopmentServer',
  async ({ openUI }) => {
    try {
      const terminal = vscode.window.createTerminal(
        'Temporal Development Server',
      );

      terminal.show();
      terminal.sendText('temporal server start-dev');

      const openWebUI = 'Open the Web UI';

      const result = await vscode.window.showInformationMessage(
        'Temporal Development Server started.',
        openWebUI,
      );

      if (result === openWebUI) {
        openUI();
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Error: ${(error as Error).message}`);
    }
  },
);
