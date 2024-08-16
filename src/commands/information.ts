import * as vscode from 'vscode';

export const getSystemInfo: Command = async ({ getClient }) => {
  const client = await getClient();
  const result = await client.workflowService.getSystemInfo({});

  vscode.window.showInformationMessage(`${result}`);
};

export const getClusterInfo: Command = async ({ getClient }) => {
  const client = await getClient();
  const result = await client.workflowService.getClusterInfo({});

  vscode.window.showInformationMessage(`${result}`);
};
