import * as vscode from 'vscode';
import { registerCommand } from '../utilities/register-command';

export const listBatchOperations = registerCommand(
  'listBatchOperations',
  async ({ client, namespace, openUI }) => {
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

      const selected = batchOperations.find(
        ({ jobId }) => jobId === selectedId,
      );

      if (!selected || !selected.jobId) {
        vscode.window.showInformationMessage(
          'Could not access selected schedule.',
        );
        return;
      }

      openUI(`batch-operations/${selected.jobId}`);
    } catch (error) {
      vscode.window.showErrorMessage(`Error: ${(error as Error).message}`);
    }
  },
);
