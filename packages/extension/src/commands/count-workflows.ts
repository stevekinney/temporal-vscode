import * as vscode from 'vscode';
import { kebabCase, sentenceCase } from 'change-case';

import type { TemporalClient } from '$utilities/client';
import { decode } from '$utilities/decode';

import { Command } from '$components/command';
import {
  StatusBarItemGroup,
  StatusBarItemParameters,
} from '$components/status-bar-item';

/**
 * @summary Show count of workflows
 */
Command.register('countWorkflows', async ({ getClient, withClient }) => {
  const client = await getClient();
  const counts = await countWorkflows(client);

  const items = StatusBarItemGroup.create(formatStatusCounts(counts));

  items.setInterval(async () => {
    withClient(async (client) => {
      const counts = await countWorkflows(client);
      items.update(formatStatusCounts(counts));
    });
  }, 5000);

  items.show();
});

const quotesExpression = /"/g;
const removeQuotes = (value: string) => value.replace(quotesExpression, '');

const isExecutionStatus = (
  value: string,
): value is keyof typeof statusIcons => {
  return value in statusIcons;
};

type ExecutionStatus =
  | 'Running'
  | 'Completed'
  | 'Failed'
  | 'Canceled'
  | 'Terminated'
  | 'ContinuedAsNew'
  | 'TimedOut';

const statusIcons: Record<ExecutionStatus, string> = {
  Running: '$(play)',
  Completed: '$(check)',
  Failed: '$(error)',
  Canceled: '$(circle-slash)',
  Terminated: '$(trash)',
  ContinuedAsNew: '$(sync)',
  TimedOut: '$(clock)',
} as const;

const statusColors: Record<ExecutionStatus, vscode.ThemeColor> = {
  Running: 'rgb(147, 187, 253)',
  Completed: 'rgb(174, 255, 216)',
  Failed: 'rgb(255, 196, 168)',
  Canceled: 'rgb(201, 217, 240)',
  Terminated: 'rgb(254, 233, 137)',
  ContinuedAsNew: 'rgb(226, 214, 254)',
  TimedOut: 'rgb(254, 204, 170)',
} as const;

const commands: Record<ExecutionStatus, CommandName> = {
  Running: 'viewRunningWorkflows',
  Completed: 'viewCompletedWorkflows',
  Failed: 'viewFailedWorkflows',
  Canceled: 'viewCanceledWorkflows',
  Terminated: 'viewTerminatedWorkflows',
  ContinuedAsNew: 'viewContinuedAsNewWorkflows',
  TimedOut: 'viewTimedOutWorkflows',
};

/**
 * Count the number of workflows by status
 * @param client A reference to a Temporal client
 * @returns A record of the count of workflows by status
 */
export const countWorkflows = async (
  client: TemporalClient,
): Promise<Record<string, number>> => {
  const response = await client.workflowService.countWorkflowExecutions({
    namespace: client.options.namespace,
    query: 'GROUP BY ExecutionStatus',
  });

  const { groups, count } = decode(response);

  const data = groups.reduce<Record<string, number>>(
    (result, { groupValues, count }) => {
      const status = groupValues?.[0]?.data;

      if (status && count) {
        result[status] = count;
      }

      return result;
    },
    {},
  );

  return { ...data, Total: count };
};

export const formatStatusCounts = (
  params: Record<string, number>,
): StatusBarItemParameters[] => {
  const parameters: StatusBarItemParameters[] = [];

  for (const [status, count] of Object.entries(params)) {
    const s = removeQuotes(status);
    if (isExecutionStatus(s)) {
      parameters.push(formatStatusCount(s, count));
    }
  }

  return parameters;
};

export const formatStatusCount = (
  status: ExecutionStatus,
  count: number,
): StatusBarItemParameters => {
  return {
    id: kebabCase(`${status.toLowerCase()}-workflows`),
    tooltip: sentenceCase(`${count} ${status} workflows`),
    text: `${getIcon(status)} ${count}`,
    color: getColor(status),
    command: getCommand(status),
  };
};

const getIcon = (status: string): string => {
  if (status in statusIcons) {
    return statusIcons[status as keyof typeof statusIcons];
  }

  return status;
};

const getColor = (status: string): vscode.ThemeColor | undefined => {
  if (status in statusColors) {
    return statusColors[status as keyof typeof statusColors];
  }

  return undefined;
};

const getCommand = (status: ExecutionStatus): CommandName => {
  return commands[status];
};
