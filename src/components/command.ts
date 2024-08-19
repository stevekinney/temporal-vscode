import * as vscode from 'vscode';
import { type TemporalClient } from '$utilities/create-client';
import { openUI } from '$utilities/open-ui';

const extensionId = 'temporal-vscode';

type ExtensionCommand = (parameters: {
  openUI: typeof openUI;
  context: vscode.ExtensionContext;
  getClient: () => Promise<TemporalClient>;
}) => Promise<void> | void;

export class Command {
  static context: vscode.ExtensionContext;

  static register(name: string, command: ExtensionCommand) {
    console.log('Command.register', name);
    return new Command(name, command);
  }

  static execute(command: string) {
    return vscode.commands.executeCommand(`${extensionId}.${command}`);
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
      async () => {
        const { createClient } = await import('$utilities/create-client');
        let client: TemporalClient | undefined = undefined;

        try {
          await command({
            context: this.context,
            getClient: async () => {
              client = client || (await createClient());
              return client;
            },
            openUI,
          });

          // Close the connection when the command is done.
          if (client !== undefined) {
            (client as TemporalClient).connection.close();
            client = undefined;
          }
        } catch (error) {
          vscode.window.showErrorMessage((error as Error).message);
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
