import { commands } from 'vscode';

const settingsKey = 'temporal';

export const openSettings: Command = async () => {
  await commands.executeCommand('workbench.action.openSettings', settingsKey);
};
