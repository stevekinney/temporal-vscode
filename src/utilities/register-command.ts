import * as vscode from 'vscode';
import { createClient } from './create-client';
import { openUI } from './open-ui';

import type { Client } from '@temporalio/client';

const extensionId = 'temporal-vscode';

type Command = (
  command: string,
  callback: (configuration: CommandParameters) => any,
) => ({ context }: { context: vscode.ExtensionContext }) => vscode.Disposable;

class CommandParameters {
  public openUI = openUI;
  public context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  getClient(): Promise<Client> {
    return createClient();
  }
}

/**
 *
 * @param command The name of the command you want to register. This will automatically be prefixed with the extension ID (e.g. `temporal-vscode`).
 * @param callback The function that will be called when the command is executed.
 * @returns
 */
export const registerCommand: Command =
  (command, callback) =>
  ({ context }) => {
    const fn = vscode.commands.registerCommand(
      `${extensionId}.${command}`,
      async () => {
        try {
          const parameters = new CommandParameters(context);
          callback(parameters);
        } catch (error) {
          vscode.window.showErrorMessage((error as Error).message);
        }
      },
    );

    context.subscriptions.push(fn);

    return fn;
  };
