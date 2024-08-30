type UIRoute = {
  namespaces: `namespaces`;
  namespace: `${UIRoute['namespaces']}/${string}`;
  taskQueue: `task-queues/${string}`;
  workflows: `workflows`;
  workflowsWithQuery: `workflows?query=${string}`;
  workflow:
    | `${UIRoute['workflows']}/${string}`
    | `${UIRoute['workflows']}/${string}/${string}`;
  'batch-operations': `batch-operations`;
  'batch-operation': `${UIRoute['batch-operations']}/${string}`;
  schedules: `schedules`;
  schedule: `${UIRoute['schedules']}/${string}`;
};

type APIRoute = {
  systemInfo: `system-info`;
  clusterInfo: `cluster-info`;
  namespaces: `namespaces`;
  namespace: `namespaces/${string}`;
};

declare module '*.css' {
  const content: string;
  export default content;
}
