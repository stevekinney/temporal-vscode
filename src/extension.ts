import * as vscode from 'vscode';

import {
  onTerminalChanges,
  startDevelopmentServer,
  stopDevelopmentServer,
} from './server';

import {
  countWorkflows,
  viewWorkflows,
  openWorkflow,
} from './commands/list-workflows';
import { startWorkflow } from './commands/start-workflow';
import { showTaskQueue } from './commands/show-task-queue';
import { openSchedule, viewSchedules } from './commands/list-schedules';
import { openBatchOperation } from './commands/list-batch-operations';
import {
  openSettings,
  updateDefaultNamespaceForUser,
  updateDefaultNamespaceForWorkspace,
} from './commands/set-configuration';
import { getSearchAttributes } from './commands/search-attributes';
import { getClusterInfo, getSystemInfo } from './commands/information';

export async function activate(context: vscode.ExtensionContext) {
  getSearchAttributes({ context });
  startWorkflow({ context });
  viewWorkflows({ context });
  countWorkflows({ context });
  openWorkflow({ context });
  openBatchOperation({ context });
  viewSchedules({ context });
  openSchedule({ context });
  showTaskQueue({ context });
  startDevelopmentServer({ context });
  stopDevelopmentServer({ context });
  updateDefaultNamespaceForUser({ context });
  updateDefaultNamespaceForWorkspace({ context });
  openSettings({ context });
  getSystemInfo({ context });
  getClusterInfo({ context });

  context.subscriptions.push(...onTerminalChanges());
}

export function deactivate() {}
