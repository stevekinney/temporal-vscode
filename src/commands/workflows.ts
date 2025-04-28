import * as vscode from 'vscode';
import { Command } from '$components/command';
import { select } from '$utilities/select';

/**
 * @summary View workflows in the UI
 */
Command.register('viewWorkflows', ({ openUI }) => {
  return openUI('workflows');
});

/**
 * @summary Open workflow in the UI
 */
Command.register('openWorkflow', async ({ getClient, openUI }) => {
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
      `${execution?.workflowId} (Run ID: ${execution?.runId})`,
    title: 'Open Workflow',
    placeHolder: 'Select a workflow to view',
  });

  if (!selectedWorkflow || !selectedWorkflow.execution) {
    vscode.window.showInformationMessage('Could not access selected workflow.');
    return;
  }

  const { workflowId, runId } = selectedWorkflow.execution;
  openUI(`workflows/${workflowId}/${runId}`);
});

/**
 * @summary View running workflows in the UI
 */
Command.register('viewRunningWorkflows', async ({ openUI }) => {
  openUI('workflows', { query: { query: 'ExecutionStatus="Running"' } });
});

/**
 * @summary View completed workflows in the UI
 */
Command.register('viewCompletedWorkflows', async ({ openUI }) => {
  openUI('workflows', { query: { query: 'ExecutionStatus="Completed"' } });
});

/**
 * @summary View failed workflows in the UI
 */
Command.register('viewFailedWorkflows', async ({ openUI }) => {
  openUI('workflows', { query: { query: 'ExecutionStatus="Failed"' } });
});

/**
 * @summary View canceled workflows in the UI
 */
Command.register('viewCanceledWorkflows', async ({ openUI }) => {
  openUI('workflows', { query: { query: 'ExecutionStatus="Canceled"' } });
});

/**
 * @summary View terminated workflows in the UI
 */
Command.register('viewTerminatedWorkflows', async ({ openUI }) => {
  openUI('workflows', { query: { query: 'ExecutionStatus="Terminated"' } });
});

/**
 * @summary View continued as new workflows in the UI
 */
Command.register('viewContinuedAsNewWorkflows', async ({ openUI }) => {
  openUI('workflows', {
    query: { query: 'ExecutionStatus="ContinuedAsNew"' },
  });
});

/**
 * @summary View timed out workflows in the UI
 */
Command.register('viewTimedOutWorkflows', async ({ openUI }) => {
  openUI('workflows', { query: { query: 'ExecutionStatus="TimedOut"' } });
});

/**
 * @summary View workflows with custom query in the UI
 */
Command.register(
  'viewWorkflowsWithQuery',
  async ({ openUI }, query: string | undefined) => {
    query =
      query ||
      (await vscode.window.showInputBox({
        prompt: 'Enter a custom query to view workflows',
        placeHolder: 'ExecutionStatus="Running"',
      }));

    if (!query) {
      return;
    }

    openUI('workflows', { query: { query } });
  },
);
