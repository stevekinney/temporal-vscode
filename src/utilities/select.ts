import * as vscode from 'vscode';
import pluralize from 'pluralize';
import type { TemporalClient } from './create-client';

export const select = async <T, F extends string>({
  client,
  name,
  data,
  format,
  ...options
}: {
  client: TemporalClient;
  name: string;
  data: (client: TemporalClient) => Promise<ArrayLike<T>>;
  format: (item: T) => F;
} & vscode.QuickPickOptions): Promise<T> => {
  const items = await data(client);

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error(`No ${pluralize(name)} found.`);
  }

  const listItems = items.map(format);
  const selectedId = await vscode.window.showQuickPick(listItems, options);
  const selectedItem = items.find((item) => format(item) === selectedId);

  if (!selectedItem) {
    throw new Error(`Could not access selected ${name}.`);
  }

  return selectedItem;
};
