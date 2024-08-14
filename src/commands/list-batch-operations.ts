import * as vscode from 'vscode';
import type { Client } from '@temporalio/client';

export const listBatchOperations = ({
  client,
  namespace,
  webUI,
}: {
  client: Client;
  namespace: string;
  webUI: string;
}) =>
  vscode.commands.registerCommand(
    'temporal-vscode.listBatchOperations',
    async () => {
      try {
        const batchOperations = await client.workflowService
          .listBatchOperations({ namespace })
          .then((batchOperations) => batchOperations.operationInfo);

        if (!Array.isArray(batchOperations) || batchOperations.length === 0) {
          vscode.window.showInformationMessage('No batch operations found.');
          return;
        }

        // Create a list of workflows to show in a dropdown
        const listItems = batchOperations
          .map((batchOperation) => String(batchOperation.jobId))
          .filter(Boolean);

        const selectedId = await vscode.window.showQuickPick(listItems, {
          placeHolder: 'Select a batch operation to view',
        });

        if (!selectedId) {
          return;
        }

        const selectedItem = batchOperations.find(
          ({ jobId }) => jobId === selectedId,
        );

        if (!selectedItem || !selectedItem.jobId) {
          vscode.window.showInformationMessage(
            'Could not access selected schedule.',
          );
          return;
        }

        const { jobId } = selectedItem;

        const url = `http://${webUI}/namespaces/${namespace}/batch-operations/${jobId}`;
        vscode.env.openExternal(vscode.Uri.parse(url));
      } catch (error) {
        vscode.window.showErrorMessage(`Error: ${(error as Error).message}`);
      }
    },
  );
