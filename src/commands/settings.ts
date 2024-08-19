import * as vscode from 'vscode';
import { Command } from '$components/command';

const settingsKey = 'temporal';

/**
 * @summary Open settings
 */
Command.register('openSettings', async () => {
  await vscode.commands.executeCommand(
    'workbench.action.openSettings',
    settingsKey,
  );
});

const changeNamespace = (target: vscode.ConfigurationTarget) => async () => {
  const value = await vscode.window.showInputBox({
    title: 'Change Default Namespace',
    placeHolder: 'Enter a new default namespace',
  });

  if (value) {
    await vscode.workspace
      .getConfiguration(settingsKey)
      .update('namespace', value, target);
  }
};

/**
 * @summary Change default namespace (User)
 */
Command.register(
  'changeDefaultNamespace.user',
  changeNamespace(vscode.ConfigurationTarget.Global),
);

/**
 * @summary Change default namespace (Workspace)
 */
Command.register(
  'changeDefaultNamespace.workspace',
  changeNamespace(vscode.ConfigurationTarget.Workspace),
);
