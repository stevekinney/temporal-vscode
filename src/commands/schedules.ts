import * as vscode from 'vscode';
import { Command } from '$components/command';
import { TemporalClient } from '$utilities/create-client';
import { select } from '$utilities/select';

Command.register('viewSchedules', ({ openUI }) => {
  return openUI('schedules');
});

Command.register('openSchedule', async ({ getClient, openUI }) => {
  try {
    const client = await getClient();
    const { namespace } = client.options;

    const selectedItem = await select({
      client,
      name: 'schedule',
      data: async (client) =>
        client.workflowService
          .listSchedules({ namespace })
          .then((response) => response.schedules),
      format: (schedule) => String(schedule.scheduleId),
      placeHolder: 'Select a schedule to view',
    });

    if (selectedItem) {
      openUI(`schedules/${selectedItem.scheduleId}`);
    } else {
      vscode.window.showInformationMessage(
        'Could not access selected schedule.',
      );
    }
  } catch (error) {
    vscode.window.showErrorMessage((error as Error).message);
  }
});

Command.register('deleteSchedule', async ({ getClient }) => {
  try {
    const client = await getClient();
    const { namespace } = client.options;

    const selectedItem = await select({
      client,
      name: 'schedule',
      data: async (client) =>
        client.workflowService
          .listSchedules({ namespace })
          .then((response) => response.schedules),
      format: (schedule) => String(schedule.scheduleId),
      placeHolder: 'Select a schedule to delete',
    });

    if (selectedItem) {
      await client.workflowService.deleteSchedule({
        namespace,
        scheduleId: selectedItem.scheduleId,
      });

      vscode.window.showInformationMessage(
        `Schedule ${selectedItem.scheduleId} deleted.`,
      );
    } else {
      vscode.window.showInformationMessage(
        'Could not access selected schedule.',
      );
    }
  } catch (error) {
    vscode.window.showErrorMessage((error as Error).message);
  }
});
