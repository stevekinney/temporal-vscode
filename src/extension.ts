import * as vscode from 'vscode';
import { Connection, Client } from '@temporalio/client';

import { listWorkflows } from './commands/list-workflows';
import { listNamespaces } from './commands/list-namespaces';

export async function activate(context: vscode.ExtensionContext) {
  const configuration = vscode.workspace.getConfiguration('temporal');

  const namespace = configuration.get('namespace') as string;
  const address = configuration.get('address') as string;
  const webUI = configuration.get('web-ui') as string;

  const connection = await Connection.connect({ address });
  const client = new Client({ connection });

  context.subscriptions.push(
    listWorkflows({ client, namespace, webUI }),
    listNamespaces({ client, webUI }),
  );
}

export function deactivate() {}
