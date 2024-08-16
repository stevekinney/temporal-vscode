import * as vscode from 'vscode';

export const viewBatchOperations: Command = async ({ openUI }) => {
  return openUI('batch-operations');
};

export const openBatchOperation: Command = async ({ getClient, openUI }) => {
  const client = await getClient();
  const { namespace } = client.options;

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
    title: 'Batch Operations',
    placeHolder: 'Select a batch operation to view',
  });

  if (!selectedId) {
    return;
  }

  const selected = batchOperations.find(({ jobId }) => jobId === selectedId);

  if (!selected || !selected.jobId) {
    vscode.window.showInformationMessage(
      'Could not access selected batch operation.',
    );
    return;
  }

  openUI(`batch-operations/${selected.jobId}`);
};
