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
 * @summary Open workflow
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
 * @summary View running workflows
 */
Command.register('viewRunningWorkflows', async ({ openUI }) => {
  openUI('workflows', { query: { query: 'ExecutionStatus="Running"' } });
});

/**
 * @summary View completed workflows
 */
Command.register('viewCompletedWorkflows', async ({ openUI }) => {
  openUI('workflows', { query: { query: 'ExecutionStatus="Completed"' } });
});

/**
 * @summary View failed workflows
 */
Command.register('viewFailedWorkflows', async ({ openUI }) => {
  openUI('workflows', { query: { query: 'ExecutionStatus="Failed"' } });
});

/**
 * @summary View canceled workflows
 */
Command.register('viewCanceledWorkflows', async ({ openUI }) => {
  openUI('workflows', { query: { query: 'ExecutionStatus="Canceled"' } });
});

/**
 * @summary View terminated workflows
 */
Command.register('viewTerminatedWorkflows', async ({ openUI }) => {
  openUI('workflows', { query: { query: 'ExecutionStatus="Terminated"' } });
});

/**
 * @summary View continued as new workflows
 */
Command.register('viewContinuedAsNewWorkflows', async ({ openUI }) => {
  openUI('workflows', {
    query: { query: 'ExecutionStatus="ContinuedAsNew"' },
  });
});

/**
 * @summary View timed out workflows
 */
Command.register('viewTimedOutWorkflows', async ({ openUI }) => {
  openUI('workflows', { query: { query: 'ExecutionStatus="TimedOut"' } });
});
