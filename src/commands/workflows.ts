import * as vscode from 'vscode';
import { Command } from '$components/command';
import { select } from '$utilities/select';

/**
 * @summary View workflows
 */
Command.register('viewWorkflows', ({ openUI }) => {
  return openUI('workflows');
});

/**
 * @summary Count workflows
 */
Command.register('countWorkflows', async ({ getClient }) => {
  const client = await getClient();
  const result = await client.workflowService.countWorkflowExecutions({
    namespace: client.options.namespace,
  });

  vscode.window.showInformationMessage(`Total workflows: ${result.count}`);
});

/**
 * @summary Open workflow
 */
Command.register('openWorkflow', async ({ getClient, openUI }) => {
  try {
    const client = await getClient();
    const namespace = client.options.namespace;

    const selectedWorkflow = await select({
      client,
      name: 'workflow',
      data: async (client) =>
        client.workflowService
          .listWorkflowExecutions({ namespace })
          .then((response) => response.executions),
      format: ({ execution }) =>
        `${execution?.workflowId} / ${execution?.runId}`,
      placeHolder: 'Select a workflow to view',
    });

    if (!selectedWorkflow || !selectedWorkflow.execution) {
      vscode.window.showInformationMessage(
        'Could not access selected workflow.',
      );
      return;
    }

    const { workflowId, runId } = selectedWorkflow.execution;
    openUI(`workflows/${workflowId}/${runId}`);
  } catch (error) {
    vscode.window.showErrorMessage((error as Error).message);
  }
});
