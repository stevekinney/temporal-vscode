import * as vscode from 'vscode';
import { Command } from '$components/command';
import { select } from '$utilities/select';
import { StatusBarItem } from '$components/status-bar-item';
import type { TemporalClient } from '$utilities/client';
import { decode } from '$utilities/decode';

/**
 * Count the number of workflows by status
 * @param client A reference to a Temporal client
 * @returns A record of the count of workflows by status
 */
const countWorkflows = async (
  client: TemporalClient,
): Promise<Record<string, number>> => {
  const response = await client.workflowService.countWorkflowExecutions({
    namespace: client.options.namespace,
    query: 'GROUP BY ExecutionStatus',
  });

  const { groups, count } = decode(response);

  const data = groups.reduce<Record<string, number>>(
    (result, { groupValues, count }) => {
      const status = groupValues?.[0]?.data;

      if (status && count) {
        result[status] = count;
      }

      return result;
    },
    {},
  );

  return { ...data, total: count };
};

/**
 * @summary View workflows
 */
Command.register('viewWorkflows', ({ openUI }) => {
  return openUI('workflows');
});

/**
 * @summary Show count of workflows
 */
Command.register('countWorkflows', async ({ getClient, withClient }) => {
  const client = await getClient();

  const response = await client.workflowService.countWorkflowExecutions({
    namespace: client.options.namespace,
    query: 'GROUP BY ExecutionStatus',
  });

  console.log(await countWorkflows(client));

  const item = StatusBarItem.create({
    id: 'running-workflows',
    text: `Workflows: ${response.count}`,
  });

  item.setInterval(async () => {
    withClient(async (client) => {
      const response = await client.workflowService.countWorkflowExecutions({
        namespace: client.options.namespace,
      });
      item.text = `Workflows: ${response.count}`;
    });
  }, 5000);

  item.show();
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
