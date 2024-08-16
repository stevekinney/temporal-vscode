import { env, Uri } from 'vscode';
import { configuration } from './configuration';

type Options = {
  base?: Uri;
  namespace?: string;
};

type Route = {
  namespaces: `namespaces`;
  namespace: `${Route['namespaces']}/${string}`;
  taskQueue: `task-queues/${string}`;
  workflows: `workflows`;
  workflow:
    | `${Route['workflows']}/${string}`
    | `${Route['workflows']}/${string}/${string}`;
  'batch-operations': `batch-operations`;
  'batch-operation': `${Route['batch-operations']}/${string}`;
  schedules: `schedules`;
  schedule: `${Route['schedules']}/${string}`;
};

export async function openUI<R extends keyof Route>(
  path: Route[R] | undefined = undefined,
  {
    base = Uri.parse(configuration.ui.href),
    namespace = configuration.namespace,
  }: Options = {},
) {
  const uri = Uri.joinPath(base, 'namespaces', namespace, path ?? '');
  env.openExternal(uri);
}
