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
import { openSettings } from './commands/settings';
import { registerCommand } from '$register';

export async function activate(context: vscode.ExtensionContext) {
  registerCommand(getSearchAttributes, { context });
  registerCommand(startWorkflow, { context });
  registerCommand(viewWorkflows, { context });
  registerCommand(countWorkflows, { context });
  registerCommand(openWorkflow, { context });
  registerCommand(openBatchOperation, { context });
  registerCommand(viewSchedules, { context });
  registerCommand(openSchedule, { context });
  registerCommand(showTaskQueue, { context });
  registerCommand(startDevelopmentServer, { context });
  registerCommand(stopDevelopmentServer, { context });
  registerCommand(openSettings, { context });
  registerCommand(getSystemInfo, { context });
  registerCommand(getClusterInfo, { context });

  context.subscriptions.push(...onTerminalChanges());
}

export function deactivate() {}
