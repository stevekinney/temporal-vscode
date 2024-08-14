import { window, workspace, commands } from 'vscode';
import { registerCommandWithoutClient } from '../utilities/register-command';

type Property = {
  title: string;
  description: string;
};

const settingsKey = 'temporal';

const updateConfiguration = async (
  key: string,
  { title, description }: Property,
  global: boolean,
) => {
  const currentValue = workspace
    .getConfiguration()
    .get(`${settingsKey}.${key}`);

  let value: any = await window.showInputBox({
    placeHolder: title,
    prompt: description,
    value: String(currentValue),
  });

  if (!value) {
    return;
  }

  workspace.getConfiguration().update(key, value, global);

  window.showInformationMessage(
    `Temporal: Updated ${title.toLowerCase()} to ${value}.`,
  );
};

const updateDefaultNamespace = (global: boolean) =>
  updateConfiguration(
    `namespace`,
    {
      title: 'Default namespace',
      description: 'Enter the default namespace for your Temporal workflows.',
    },
    global,
  );

export const updateDefaultNamespaceForWorkspace = registerCommandWithoutClient(
  'setDefaultNamespace.workspace',
  () => updateDefaultNamespace(false),
);

export const updateDefaultNamespaceForUser = registerCommandWithoutClient(
  'setDefaultNamespace.user',
  () => updateDefaultNamespace(true),
);

export const openSettings = registerCommandWithoutClient(
  'openSettings',
  async () => {
    await commands.executeCommand('workbench.action.openSettings', settingsKey);
  },
);
