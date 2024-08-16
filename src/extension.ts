import * as vscode from 'vscode';

import {
  onTerminalChanges,
  startDevelopmentServer,
  stopDevelopmentServer,
} from './server';

import {
  countWorkflows,
  listWorkflows,
  openWorkflow,
} from './commands/list-workflows';
import { startWorkflow } from './commands/start-workflow';
import { showTaskQueue } from './commands/show-task-queue';
import { openSchedules } from './commands/list-schedules';
import { listBatchOperations } from './commands/list-batch-operations';
import {
  openSettings,
  updateDefaultNamespaceForUser,
  updateDefaultNamespaceForWorkspace,
} from './commands/set-configuration';
import { getSearchAttributes } from './commands/search-attributes';

export async function activate(context: vscode.ExtensionContext) {
  getSearchAttributes({ context });
  startWorkflow({ context });
  listWorkflows({ context });
  countWorkflows({ context });
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
