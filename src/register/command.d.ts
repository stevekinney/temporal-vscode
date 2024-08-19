type Command = (
  parameters: import('./command-parameters').CommandParameters,
) => Promise<void> | void;

type WithContext<T extends { [key: string]: unknown } = {}> = T & {
  context: import('vscode').ExtensionContext;
};
