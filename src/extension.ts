import * as vscode from 'vscode';

import { listWorkflows } from './commands/list-workflows';
import { listNamespaces } from './commands/list-namespaces';
import { showTaskQueue } from './commands/show-task-queue';
import { listSchedules } from './commands/list-schedules';
import { listBatchOperations } from './commands/list-batch-operations';
import { startDevelopmentServer } from './commands/start-development-server';
import {
  openSettings,
  updateDefaultNamespaceForUser,
  updateDefaultNamespaceForWorkspace,
} from './commands/set-configuration';

export async function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    listWorkflows(),
    listNamespaces(),
    listBatchOperations(),
    listSchedules(),
    showTaskQueue(),
    startDevelopmentServer(),
    updateDefaultNamespaceForUser(),
    updateDefaultNamespaceForWorkspace(),
    openSettings(),
  );
}

export function deactivate() {}
