import * as vscode from 'vscode';
import { createClient } from './create-client';
import { openUI } from './open-ui';

import type { Client } from '@temporalio/client';

const extensionId = 'temporal-vscode';

type Configuration = {
  client: Client;
  namespace: string;
  openUI: typeof openUI;
};

type ConfigurationWithoutClient = Omit<Configuration, 'client'>;

type Command<
  T extends Configuration | ConfigurationWithoutClient = Configuration,
> = (
  command: string,
  callback: (configuration: T) => any,
) => () => vscode.Disposable;

/**
 *
 * @param command The name of the command you want to register. This will automatically be prefixed with the extension ID (e.g. `temporal-vscode`).
 * @param callback The function that will be called when the command is executed.
 * @returns
 */
export const registerCommand: Command = (command, callback) => () =>
  vscode.commands.registerCommand(`${extensionId}.${command}`, async () => {
    try {
      const configuration = vscode.workspace.getConfiguration('temporal');
      const namespace = configuration.get('namespace') as string;

      const client = await createClient();

      if (!client) {
        return;
      }

      callback({ client, namespace, openUI });
    } catch (error) {
      vscode.window.showErrorMessage((error as Error).message);
    }
  });

export const registerCommandWithoutClient: Command<
  ConfigurationWithoutClient
> = (command, callback) => () => {
  console.log(`${extensionId}.${command}`);
  return vscode.commands.registerCommand(
    `${extensionId}.${command}`,
    async () => {
      try {
        const configuration = vscode.workspace.getConfiguration('temporal');
        const namespace = configuration.get('namespace') as string;

        callback({ namespace, openUI });
      } catch (error) {
        vscode.window.showErrorMessage((error as Error).message);
      }
    },
  );
};
