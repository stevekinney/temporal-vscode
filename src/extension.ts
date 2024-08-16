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
} from './commands/workflows';
import { startWorkflow } from './commands/start-workflow';
import { showTaskQueue } from './commands/task-queue';
import { openSchedule, viewSchedules } from './commands/schedules';
import { openBatchOperation } from './commands/batch-operations';
import { getSearchAttributes } from './commands/search-attributes';
import { getClusterInfo, getSystemInfo } from './commands/information';
import {
  openSettings,
  updateDefaultNamespaceForUser,
  updateDefaultNamespaceForWorkspace,
} from './commands/settings';

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
