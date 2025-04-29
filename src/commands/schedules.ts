import * as vscode from 'vscode';
import { Command } from '$components/command';
import { select } from '$utilities/select';

/**
 * @summary View schedules in the UI
 */
Command.register('viewSchedules', ({ openUI }) => {
  return openUI('schedules');
});

/**
 * @summary Open schedule in the UI
 */
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
      title: 'Open Schedule',
      placeHolder: 'Select a schedule to view',
    });

    openUI(`schedules/${selectedItem.scheduleId}`);
  } catch (error) {
    vscode.window.showErrorMessage((error as Error).message);
  }
});

/**
 * @summary Delete schedule
 */
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
      title: 'Delete Schedule',
      placeHolder: 'Select a schedule to delete',
    });

    await client.workflowService.deleteSchedule({
      namespace,
      scheduleId: selectedItem.scheduleId,
    });

    vscode.window.showInformationMessage(
      `Schedule ${selectedItem.scheduleId} deleted.`,
    );
  } catch (error) {
    vscode.window.showErrorMessage((error as Error).message);
  }
});
