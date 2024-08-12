import * as vscode from 'vscode';
import type { Client } from '@temporalio/client';

export const listNamespaces = ({
  client,
  webUI,
}: {
  client: Client;
  webUI: string;
  namespace?: string;
}) =>
  vscode.commands.registerCommand(
    'temporal-vscode.listNamespaces',
    async () => {
      try {
        const { namespaces } = await client.workflowService.listNamespaces({});

        if (!Array.isArray(namespaces) || namespaces.length === 0) {
          vscode.window.showInformationMessage('No namespaces found.');
          return;
        }

        console.log({ namespaces });

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
          (namespace) =>
            namespace.namespaceInfo?.name === selectedNamespaceName,
        );

        if (!selectedNamespace || !selectedNamespace.namespaceInfo?.name) {
          vscode.window.showInformationMessage(
            'Could not access selected workflow.',
          );
          return;
        }

        const { name } = selectedNamespace.namespaceInfo;

        const url = `http://${webUI}/namespaces/${name}`;
        vscode.env.openExternal(vscode.Uri.parse(url));
      } catch (error) {
        vscode.window.showErrorMessage(`Error: ${(error as Error).message}`);
      }
    },
  );
