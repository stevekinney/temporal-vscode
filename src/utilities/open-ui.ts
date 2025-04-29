import { env, Uri, window, ProgressLocation } from 'vscode';
import { configuration } from './configuration';

/**
 * Build query string and filter out undefined and null values.
 */
const buildQuery = (query: Record<string, string | undefined>) => {
  if (!query) {
    return '';
  }

  return Object.entries(query)
    .filter(([_, value]) => value !== undefined && value !== null)
    .reduce(
      (acc, [key, value]) => {
        acc += `${acc ? '&' : ''}${key}=${value}`;
        return acc;
      },
      '',
    );
};

/**
 * Options for opening the Temporal UI
 */
export interface OpenUIOptions {
  /**
   * The base URI of the Temporal UI
   * @default configuration.ui.href
   */
  base?: Uri;

  /**
   * The namespace to use
   * @default configuration.namespace
   */
  namespace?: string;

  /**
   * Query parameters to include in the URL
   */
  query?: Record<string, string>;

  /**
   * Whether to silently handle errors instead of showing error messages
   * @default false
   */
  silent?: boolean;

  /**
   * Title for progress notification when opening the UI
   * @default 'Opening Temporal UI'
   */
  progressTitle?: string;
}

/**
 * Opens the Temporal UI in the default browser.
 *
 * @param path The path to open in the UI. If not provided, the base URL will be used.
 * @param options Options for opening the UI
 * @returns A promise that resolves when the UI is opened or rejects if there was an error
 *
 * @example
 * // Open the workflows page
 * await openUI('workflows');
 *
 * @example
 * // Open a specific workflow with a specific run ID
 * await openUI(`workflows/${workflowId}/${runId}`);
 *
 * @example
 * // Open the UI with query parameters
 * await openUI('workflows', { query: { filter: 'running' } });
 */
export async function openUI(
  path?: UIRoute[UIRouteKey],
  options: OpenUIOptions = {},
): Promise<boolean> {
  const {
    base = Uri.parse(configuration.ui.href),
    namespace = configuration.namespace,
    query = {},
    silent = false,
    progressTitle = 'Opening Temporal UI',
  } = options;

  try {
    return await window.withProgress(
      {
        location: ProgressLocation.Notification,
        title: progressTitle,
        cancellable: false,
      },
      async () => {
        // Build the query string
        const queryString = buildQuery(query);
        // Build the URI
        const segments = ['namespaces', namespace];
        if (path) {
          segments.push(path);
        }

        let uri = Uri.joinPath(base, ...segments);

        // Add query parameters if any
        if (queryString) {
          uri = uri.with({ query: queryString });
        }

        // Open the URL in the default browser
        return await env.openExternal(uri);
      },
    );
  } catch (error) {
    if (!silent) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      window.showErrorMessage(`Failed to open Temporal UI: ${errorMessage}`);
    }

    return false;
  }
}

/**
 * Opens a specific workflow in the Temporal UI
 *
 * @param workflowId The ID of the workflow to open
 * @param runId Optional run ID of the workflow
 * @param options Additional options for opening the UI
 * @returns A promise that resolves when the UI is opened
 */
export async function openWorkflow(
  workflowId: string,
  runId?: string,
  options: Omit<OpenUIOptions, 'base'> = {},
): Promise<boolean> {
  const path = runId
    ? `workflows/${encodeURIComponent(workflowId)}/${encodeURIComponent(runId)}`
    : `workflows/${encodeURIComponent(workflowId)}`;

  return openUI(path as UIRoute[UIRouteKey], {
    progressTitle: 'Opening Workflow',
    ...options,
  });
}

/**
 * Opens the task queue page in the Temporal UI
 *
 * @param taskQueue The name of the task queue to open
 * @param options Additional options for opening the UI
 * @returns A promise that resolves when the UI is opened
 */
export async function openTaskQueue(
  taskQueue: string,
  options: Omit<OpenUIOptions, 'base'> = {},
): Promise<boolean> {
  return openUI(
    `task-queues/${encodeURIComponent(taskQueue)}` as UIRoute[UIRouteKey],
    {
      progressTitle: 'Opening Task Queue',
      ...options,
    },
  );
}

/**
 * Opens the schedules page in the Temporal UI
 *
 * @param scheduleId Optional ID of a specific schedule to open
 * @param options Additional options for opening the UI
 * @returns A promise that resolves when the UI is opened
 */
export async function openSchedule(
  scheduleId?: string,
  options: Omit<OpenUIOptions, 'base'> = {},
): Promise<boolean> {
  const path = scheduleId
    ? `schedules/${encodeURIComponent(scheduleId)}`
    : 'schedules';

  return openUI(path as UIRoute[UIRouteKey], {
    progressTitle: scheduleId ? 'Opening Schedule' : 'Opening Schedules',
    ...options,
  });
}
