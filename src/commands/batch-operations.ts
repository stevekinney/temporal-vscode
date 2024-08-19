import * as vscode from 'vscode';
import { Command } from '$components/command';
import { select } from '$utilities/select';

/**
 * @summary View batch operations
 */
Command.register('viewBatchOperations', async ({ openUI }) => {
  return openUI('batch-operations');
});

/**
 * @summary Open batch operation
 */
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

/**
 * @summary Stop batch operation
 */
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
