import * as vscode from 'vscode';
import type {
  TemporalClient,
  CreateClient,
  WithClient,
} from '$utilities/client';
import { openUI } from '$utilities/open-ui';

const extensionId = 'temporal-vscode';

type ExtensionCommand<Params extends any[] = any[]> = (
  parameters: {
    openUI: typeof openUI;
    context: vscode.ExtensionContext;
    getClient: CreateClient;
    withClient: WithClient;
  },
  ...params: Params
) => Promise<void> | void;

export class Command {
  static context: vscode.ExtensionContext;

  static register(name: string, command: ExtensionCommand) {
    return new Command(name, command);
  }

  static execute(command: CommandName, params: any[] = []): Thenable<unknown> {
    return vscode.commands.executeCommand(
      `${extensionId}.${command}`,
      ...params,
    );
  }

  static getCommand(name: CommandName): `${typeof extensionId}.${CommandName}` {
    return `${extensionId}.${name}`;
  }

  private constructor(
    public readonly name: string,
    public readonly command: ExtensionCommand,
  ) {
    if (!Command.context) {
      throw new Error('ExtensionCommand.context is not set');
    }

    const fn = vscode.commands.registerCommand(
      `${extensionId}.${name}`,
      async (...params: any[]) => {
        const { createClient, withClient } = await import('$utilities/client');

        let client: TemporalClient | undefined = undefined;

        try {
          await command({
            context: this.context,
            getClient: async () => {
              client = client || (await createClient());
              return client;
            },
            withClient,
            openUI,
            ...params,
          });

          // Close the connection when the command is done.
          if (client !== undefined) {
            (client as TemporalClient).connection.close();
            client = undefined;
          }
        } catch (error) {
          // Close the connection when the command fails.
          if (client !== undefined) {
            (client as TemporalClient).connection.close();
            client = undefined;
          }

          if (error instanceof Error) {
            // Ignore user errors.
            if (!error.message.startsWith('User')) {
              vscode.window.showErrorMessage(error.message);
            }
          }
        }
      },
    );

    this.context.subscriptions.push(fn);
  }

  private get context(): vscode.ExtensionContext {
    if (!Command.context) {
      throw new Error('ExtensionCommand.context is not set');
    }

    return Command.context;
  }
}
