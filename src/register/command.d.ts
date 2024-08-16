type Command = (
  parameters: import('./command-parameters').CommandParameters,
) => Promise<void>;
