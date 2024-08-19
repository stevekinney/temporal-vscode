import { env, Uri } from 'vscode';
import { configuration } from './configuration';

type Options = {
  base?: Uri;
  namespace?: string;
};

export async function openUI<R extends keyof UIRoute>(
  path: UIRoute[R] | undefined = undefined,
  {
    base = Uri.parse(configuration.ui.href),
    namespace = configuration.namespace,
  }: Options = {},
) {
  const uri = Uri.joinPath(base, 'namespaces', namespace, path ?? '');
  env.openExternal(uri);
}
