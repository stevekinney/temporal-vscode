import * as vscode from 'vscode';

import {
  onTerminalChanges,
  startDevelopmentServer,
  stopDevelopmentServer,
} from './server';

import { listWorkflows, openWorkflow } from './commands/list-workflows';
import { startWorkflow } from './commands/start-workflow';
import { showTaskQueue } from './commands/show-task-queue';
import { openSchedules } from './commands/list-schedules';
import { listBatchOperations } from './commands/list-batch-operations';
import {
  openSettings,
  updateDefaultNamespaceForUser,
  updateDefaultNamespaceForWorkspace,
} from './commands/set-configuration';

export async function activate(context: vscode.ExtensionContext) {
  startWorkflow({ context });
  listWorkflows({ context });
  openWorkflow({ context });
  listBatchOperations({ context });
  openSchedules({ context });
  showTaskQueue({ context });
  startDevelopmentServer({ context });
  stopDevelopmentServer({ context });
  updateDefaultNamespaceForUser({ context });
  updateDefaultNamespaceForWorkspace({ context });
  openSettings({ context });

  context.subscriptions.push(...onTerminalChanges());
}

export function deactivate() {}
