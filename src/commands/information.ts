import * as vscode from 'vscode';
import { registerCommand } from '../utilities/register-command';

export const getSystemInfo = registerCommand(
  'getSystemInfo',
  async ({ client }) => {
    const result = await client.workflowService.getSystemInfo({});

    vscode.window.showInformationMessage(`System name: ${result}`);
  },
);
