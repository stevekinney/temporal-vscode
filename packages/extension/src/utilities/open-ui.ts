import { env, Uri } from 'vscode';
import { configuration } from './configuration';

type Options = {
  base?: Uri;
  namespace?: string;
  query?: Record<string, string>;
};

export async function openUI<R extends keyof UIRoute>(
  path: UIRoute[R] | undefined = undefined,
  {
    base = Uri.parse(configuration.ui.href),
    namespace = configuration.namespace,
    query = {},
  }: Options = {},
) {
  const queryString = new URLSearchParams(query).toString();

  let uri = Uri.joinPath(base, 'namespaces', namespace, path ?? '');

  if (Object.keys(query).length && queryString) {
    uri = uri.with({ query: queryString });
  }

  env.openExternal(uri);
}
