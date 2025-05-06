import * as vscode from 'vscode';
import pluralize from 'pluralize';
import type { TemporalClient } from './client';

export interface SelectOptions<T, F extends string>
  extends vscode.QuickPickOptions {
  client: TemporalClient;
  name: string;
  data: (client: TemporalClient) => Promise<ReadonlyArray<T> | ArrayLike<T>>;
  format: (item: T) => F;
}

export const select = async <T, F extends string>({
  client,
  name,
  data,
  format,
  ...options
}: SelectOptions<T, F>): Promise<T> => {
  const items = await data(client);

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error(`No ${pluralize(name)} found.`);
  }

  const listItems = Array.from(items).map(format);
  const selectedId = await vscode.window.showQuickPick(listItems, options);

  if (!selectedId) {
    throw new Error(`User Aborted: No ${name} selected.`);
  }

  const selectedItem = items.find((item) => format(item) === selectedId);

  if (!selectedItem) {
    throw new Error(`Could not access selected ${name}.`);
  }

  return selectedItem;
};
