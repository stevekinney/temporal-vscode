import * as vscode from 'vscode';
import { registerCommand } from '$register';

export const viewWorkflows = registerCommand('viewWorkflows', ({ openUI }) => {
  return openUI('workflows');
});

export const countWorkflows = registerCommand(
  'countWorkflows',
  async ({ getClient }) => {
    const client = await getClient();
    const result = await client.workflowService.countWorkflowExecutions({
      namespace: client.options.namespace,
    });

    vscode.window.showInformationMessage(`Total workflows: ${result.count}`);
  },
);

export const openWorkflow = registerCommand(
  'openWorkflow',
  async ({ getClient, openUI }) => {
    try {
      const client = await getClient();
      const namespace = client.options.namespace;

      const workflows = await client.workflowService
        .listWorkflowExecutions({ namespace })
        .then((workflows) => workflows.executions);

      if (!Array.isArray(workflows) || workflows.length === 0) {
        vscode.window.showInformationMessage('No workflows found.');
        return;
      }

      // Create a list of workflows to show in a dropdown
      const listItems = workflows
        .map((workflow) => String(workflow.execution?.workflowId))
        .filter(Boolean);

      const selectedWorkflowId = await vscode.window.showQuickPick(listItems, {
        placeHolder: 'Select a workflow to view',
      });

      if (!selectedWorkflowId) {
        return;
      }

      const selectedWorkflow = workflows.find(
        (workflow: any) => workflow.execution.workflowId === selectedWorkflowId,
      );

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
  },
);
