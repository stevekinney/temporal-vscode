import * as vscode from 'vscode';
import { Command } from '$components/command';

type SavedQuery = vscode.QuickPickItem & { description: string };

const WORKFLOW_QUERIES = 'workflowQueries';

const shouldAddQuery = (query: vscode.QuickPickItem) => {
  const icon = query.buttons?.[0].iconPath as vscode.ThemeIcon | undefined;
  return icon?.id === new vscode.ThemeIcon('add').id;
};

const createQuery = async () => {
  const description = await vscode.window.showInputBox({
    prompt: 'Enter a custom query',
    placeHolder: 'ExecutionStatus="Running"',
  });
  if (!description) return;
  const label = await vscode.window.showInputBox({
    prompt: 'Enter a label for the query',
    placeHolder: 'My Custom Query',
  });
  if (!label) return;
  return {
    label,
    description,
  };
};

const createAndAddQuery = async (context: vscode.ExtensionContext) => {
  const query = await createQuery();
  if (!query) {
    return getQueriesFromStorage(context);
  }
  return addQueryToStorage(query, context);
};

const formatQueries = (items: SavedQuery[]) => {
  return [
    {
      label: 'Add Query',
      description: 'Add a custom query to the list',
      buttons: [
        {
          iconPath: new vscode.ThemeIcon('add'),
          tooltip: 'Add Query',
        },
      ],
    },
    ...(items.length > 0
      ? [{ label: '', kind: vscode.QuickPickItemKind.Separator }]
      : []),
    ...items.map((item) => {
      return {
        ...item,
        buttons: [
          {
            iconPath: new vscode.ThemeIcon('trash'),
            tooltip: 'Delete this query',
          },
        ],
      };
    }),
  ];
};

const getQueriesFromStorage = (
  context: vscode.ExtensionContext,
): SavedQuery[] => {
  const storedItems = context.workspaceState.get<SavedQuery[]>(
    WORKFLOW_QUERIES,
    [],
  );
  return storedItems;
};

const deleteQueryFromStorage = async (
  label: string,
  context: vscode.ExtensionContext,
) => {
  const storedItems = getQueriesFromStorage(context);
  const updatedItems = storedItems.filter((item) => item.label !== label);
  await context.workspaceState.update(WORKFLOW_QUERIES, updatedItems);
  return getQueriesFromStorage(context);
};

const addQueryToStorage = async (
  item: SavedQuery,
  context: vscode.ExtensionContext,
) => {
  const storedItems = getQueriesFromStorage(context);
  const updatedItems = [item, ...storedItems];
  await context.workspaceState.update(WORKFLOW_QUERIES, updatedItems);
  return getQueriesFromStorage(context);
};

/**
 * @summary View workflows with a custom saved query in the UI
 */
Command.register('viewWorkflowsWithSavedQuery', async ({ openUI, context }) => {
  const quickPick = vscode.window.createQuickPick();
  quickPick.matchOnDescription = true;
  quickPick.placeholder = 'Select a query to view workflows';

  const savedQueries = getQueriesFromStorage(context);
  quickPick.items = formatQueries(savedQueries);

  quickPick.onDidAccept(async () => {
    const selectedQuery = quickPick.selectedItems[0];
    if (shouldAddQuery(selectedQuery)) {
      const updatedQueries = await createAndAddQuery(context);
      quickPick.items = formatQueries(updatedQueries);
      quickPick.show();
    } else {
      const query = selectedQuery?.description;
      if (!query) return;
      openUI('workflows', { query: { query } });
    }
  });

  quickPick.onDidTriggerItemButton(async (event) => {
    const selectedQuery = event.item;

    if (shouldAddQuery(selectedQuery)) {
      const updatedQueries = await createAndAddQuery(context);
      quickPick.items = formatQueries(updatedQueries);
      quickPick.show();
    } else {
      const confirmation = await vscode.window.showWarningMessage(
        `Are you sure you want to delete the query "${selectedQuery.label}"?`,
        { modal: true },
        'Delete',
      );
      if (confirmation === 'Delete') {
        const updatedQueries = await deleteQueryFromStorage(
          selectedQuery.label,
          context,
        );
        quickPick.items = formatQueries(updatedQueries);
      }
    }
  });

  quickPick.onDidHide(() => quickPick.dispose());
  quickPick.show();
});
