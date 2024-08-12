import * as vscode from 'vscode';
import type { Client } from '@temporalio/client';

export const listWorkflows = ({
  client,
  namespace,
  webUI,
}: {
  client: Client;
  namespace: string;
  webUI: string;
}) =>
  vscode.commands.registerCommand('temporal-vscode.listWorkflows', async () => {
    try {
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

      const url = `http://${webUI}/namespaces/${namespace}/workflows/${workflowId}/${runId}`;
      vscode.env.openExternal(vscode.Uri.parse(url));
    } catch (error) {
      vscode.window.showErrorMessage(`Error: ${(error as Error).message}`);
    }
  });
