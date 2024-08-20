const extensionId = 'temporal-vscode';

type FullCommandName = `${typeof extensionId}.${CommandName}`;

export const toCommandName = (commandName: CommandName): FullCommandName => {
  return `${extensionId}.${commandName}`;
};
