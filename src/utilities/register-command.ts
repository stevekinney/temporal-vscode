import * as vscode from 'vscode';
import { createClient } from './create-client';
import { openUI } from './open-ui';

import type { Client } from '@temporalio/client';

const extensionId = 'temporal-vscode';

type Configuration = {
  client: Client;
  namespace: string;
  openUI: typeof openUI;
  context: vscode.ExtensionContext;
};

type ConfigurationWithoutClient = Omit<Configuration, 'client'>;

type Command<
  T extends Configuration | ConfigurationWithoutClient = Configuration,
> = (
  command: string,
  callback: (configuration: T) => any,
) => ({ context }: { context: vscode.ExtensionContext }) => vscode.Disposable;

/**
 *
 * @param command The name of the command you want to register. This will automatically be prefixed with the extension ID (e.g. `temporal-vscode`).
 * @param callback The function that will be called when the command is executed.
 * @returns
 */
export const registerCommand: Command<Configuration> =
  (command, callback) =>
  ({ context }) => {
    const fn = vscode.commands.registerCommand(
      `${extensionId}.${command}`,
      async () => {
        try {
          const configuration = vscode.workspace.getConfiguration('temporal');
          const namespace = configuration.get('namespace') as string;

          const client = await createClient();

          if (!client) {
            return;
          }

          callback({ client, namespace, openUI, context });
        } catch (error) {
          vscode.window.showErrorMessage((error as Error).message);
        }
      },
    );

    context.subscriptions.push(fn);

    return fn;
  };

export const registerCommandWithoutClient: Command<
  ConfigurationWithoutClient
> =
  (command, callback) =>
  ({ context }) => {
    const fn = vscode.commands.registerCommand(
      `${extensionId}.${command}`,
      async () => {
        try {
          const configuration = vscode.workspace.getConfiguration('temporal');
          const namespace = configuration.get('namespace') as string;

          callback({ namespace, openUI, context });
        } catch (error) {
          vscode.window.showErrorMessage((error as Error).message);
        }
      },
    );

    context.subscriptions.push(fn);

    return fn;
  };
