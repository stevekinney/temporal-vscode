import * as vscode from 'vscode';
import { Command } from '$components/command';
import { select } from '$utilities/select';

Command.register('viewBatchOperations', async ({ openUI }) => {
  return openUI('batch-operations');
});

Command.register('openBatchOperation', async ({ getClient, openUI }) => {
  const client = await getClient();
  const { namespace } = client.options;

  const selected = await select({
    client,
    name: 'batch operation',
    data: async (client) =>
      client.workflowService
        .listBatchOperations({ namespace })
        .then((response) => response.operationInfo),
    format: (operation) => String(operation.jobId),
    placeHolder: 'Select a batch operation',
  });

  openUI(`batch-operations/${selected.jobId}`);
});

Command.register('stopBatchOperation', async ({ getClient }) => {
  const client = await getClient();
  const { namespace } = client.options;

  const selected = await select({
    client,
    name: 'batch operation',
    data: async (client) =>
      client.workflowService
        .listBatchOperations({ namespace })
        .then((response) => response.operationInfo),
    format: (operation) => String(operation.jobId),
    placeHolder: 'Select a batch operation to stop',
  });

  await client.workflowService.stopBatchOperation({
    namespace,
    jobId: selected.jobId,
  });

  vscode.window.showInformationMessage(
    `Batch operation ${selected.jobId} has been stopped.`,
  );
});
