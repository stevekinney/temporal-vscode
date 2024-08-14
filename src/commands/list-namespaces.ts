import * as vscode from 'vscode';
import { registerCommand } from '../utilities/register-command';

export const listNamespaces = registerCommand(
  'listNamespaces',
  async ({ client, openUI }) => {
    try {
      const { namespaces } = await client.workflowService.listNamespaces({});

      if (!Array.isArray(namespaces) || namespaces.length === 0) {
        vscode.window.showInformationMessage('No namespaces found.');
        return;
      }

      const listItems = namespaces
        .filter(Boolean)
        .map((namespace) => String(namespace.namespaceInfo?.name));

      const selectedNamespaceName = await vscode.window.showQuickPick(
        listItems,
        {
          placeHolder: 'Select a namespace to view',
        },
      );

      if (!selectedNamespaceName) {
        return;
      }

      const selectedNamespace = namespaces.find(
        (namespace) => namespace.namespaceInfo?.name === selectedNamespaceName,
      );

      if (!selectedNamespace || !selectedNamespace.namespaceInfo?.name) {
        vscode.window.showInformationMessage(
          'Could not access selected workflow.',
        );
        return;
      }

      const { name } = selectedNamespace.namespaceInfo;
      openUI(`namespaces/${name}`);
    } catch (error) {
      vscode.window.showErrorMessage((error as Error).message);
    }
  },
);
