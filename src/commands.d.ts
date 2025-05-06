// This file is generated. Do not edit.
// Run `bun run generate:commands` to update this file.

type CommandName =
  | 'viewBatchOperations'
  | 'openBatchOperation'
  | 'stopBatchOperation'
  | 'countWorkflows'
  | 'getSystemInfo'
  | 'getClusterInfo'
  | 'viewWorkflowsWithSavedQuery'
  | 'viewSchedules'
  | 'openSchedule'
  | 'deleteSchedule'
  | 'getSearchAttributes'
  | 'openSettings'
  | 'changeDefaultNamespace.user'
  | 'changeDefaultNamespace.workspace'
  | 'startWorkflow'
  | 'showTaskQueue'
  | 'viewWorkflows'
  | 'openWorkflow'
  | 'viewRunningWorkflows'
  | 'viewCompletedWorkflows'
  | 'viewFailedWorkflows'
  | 'viewCanceledWorkflows'
  | 'viewTerminatedWorkflows'
  | 'viewContinuedAsNewWorkflows'
  | 'viewTimedOutWorkflows'
  | 'viewWorkflowsWithQuery'
  | 'startDevelopmentServer'
  | 'stopDevelopmentServer';

type FullCommandName = `${ExtensionId}.${CommandName}`;
