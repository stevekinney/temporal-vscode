import { env, Uri, workspace } from 'vscode';

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

const configuration = workspace.getConfiguration('temporal');

const getBase = () => Uri.parse(`http://${configuration.get('webUI')}`);
const getNamespace = () => configuration.get('namespace') as string;

export async function openUI<R extends keyof Route>(
  path: Route[R] | undefined = undefined,
  { base = getBase(), namespace = getNamespace() }: Options = {},
) {
  const uri = Uri.joinPath(base, 'namespaces', namespace, path ?? '');
  env.openExternal(uri);
}
