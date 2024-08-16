import * as vscode from 'vscode';
import { registerCommand } from '../utilities/register-command';

export const openSchedules = registerCommand(
  'openSchedule',
  async ({ client, namespace, openUI }) => {
    try {
      const schedules = await client.workflowService
        .listSchedules({ namespace })
        .then(({ schedules }) => schedules);

      if (!Array.isArray(schedules) || schedules.length === 0) {
        vscode.window.showInformationMessage('No schedules found.');
        return;
      }

      // Create a list of workflows to show in a dropdown
      const listItems = schedules
        .map((schedule) => String(schedule.scheduleId))
        .filter(Boolean);

      const selectedId = await vscode.window.showQuickPick(listItems, {
        placeHolder: 'Select a schedule to view',
      });

      if (!selectedId) {
        return;
      }

      const selectedItem = schedules.find(
        ({ scheduleId }) => scheduleId === selectedId,
      );

      if (!selectedItem || !selectedItem.scheduleId) {
        vscode.window.showInformationMessage(
          'Could not access selected schedule.',
        );
        return;
      }

      const { scheduleId } = selectedItem;

      openUI(`schedules/${scheduleId}`);
    } catch (error) {
      vscode.window.showErrorMessage((error as Error).message);
    }
  },
);
