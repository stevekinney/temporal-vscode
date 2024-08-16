import * as vscode from 'vscode';
import { CommandParameters } from './command-parameters';

const extensionId = 'temporal-vscode';

type RegisterCommandParameters = {
  context: vscode.ExtensionContext;
};

export const registerCommand = (
  command: Command,
  { context }: RegisterCommandParameters,
) => {
  const fn = vscode.commands.registerCommand(
    `${extensionId}.${command.name}`,
    async () => {
      try {
        const parameters = new CommandParameters(context);
        await command(parameters);
      } catch (error) {
        vscode.window.showErrorMessage((error as Error).message);
      }
    },
  );

  context.subscriptions.push(fn);
};

export const executeCommand = async (command: CommandName) => {
  await vscode.commands.executeCommand(`${extensionId}.${command}`);
};
