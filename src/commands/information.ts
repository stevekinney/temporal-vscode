import * as vscode from 'vscode';
import { registerCommand } from '../utilities/register-command';

export const getSystemInfo = registerCommand(
  'getSystemInfo',
  async ({ getClient }) => {
    const client = await getClient();
    const result = await client.workflowService.getSystemInfo({});

    vscode.window.showInformationMessage(`${result}`);
  },
);

export const getClusterInfo = registerCommand(
  'getSystemInfo',
  async ({ getClient }) => {
    const client = await getClient();
    const result = await client.workflowService.getClusterInfo({});

    vscode.window.showInformationMessage(`${result}`);
  },
);
