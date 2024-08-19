import * as vscode from 'vscode';
import { Command } from '$components/command';

Command.register('getSystemInfo', async ({ getClient }) => {
  const client = await getClient();
  const result = await client.workflowService.getSystemInfo({});

  vscode.window.showInformationMessage(`${result}`);
});

Command.register('getClusterInfo', async ({ getClient }) => {
  const client = await getClient();
  const result = await client.workflowService.getClusterInfo({});

  vscode.window.showInformationMessage(`${result}`);
});
