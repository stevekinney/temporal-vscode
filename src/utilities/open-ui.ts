import { env, Uri } from 'vscode';
import { configuration } from './configuration';

type Options = {
  base?: Uri;
  namespace?: string;
  query?: Record<string, string>;
};

/**
 * Opens the Temporal UI in the default browser.
 * @param path The path to open in the UI. If not provided, the base URL will be used.
 */
export async function openUI(
  path: UIRoute[UIRouteKey] | undefined = undefined,
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
