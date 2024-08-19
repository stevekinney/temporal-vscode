import * as vscode from 'vscode';
import { Command } from '$components/command';

Command.register('viewSchedules', ({ openUI }) => {
  return openUI('schedules');
});

Command.register('openSchedule', async ({ getClient, openUI }) => {
  try {
    const client = await getClient();
    const { namespace } = client.options;

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

    openUI(`schedules/${selectedItem.scheduleId}`);
  } catch (error) {
    vscode.window.showErrorMessage((error as Error).message);
  }
});

Command.register('deleteSchedule', async ({ getClient }) => {
  try {
    const client = await getClient();
    const { namespace } = client.options;

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
      placeHolder: 'Select a schedule to delete',
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
