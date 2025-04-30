import * as vscode from 'vscode';

type SavedQuery = vscode.QuickPickItem & { description: string };
const WORKFLOW_QUERIES = 'workflowQueries';

export const shouldAddQuery = (query: vscode.QuickPickItem) => {
    const icon = query.buttons?.[0].iconPath as vscode.ThemeIcon | undefined;
    return icon?.id === new vscode.ThemeIcon('add').id;
}

const createQuery = async () => {
    const description = await vscode.window.showInputBox({
        prompt: 'Enter a custom query',
        placeHolder: 'ExecutionStatus="Running"'
    });
    if (!description) {
        return;
    }
    const label = await vscode.window.showInputBox({
        prompt: 'Enter a label for the query',
        placeHolder: 'My Custom Query'
    });
    if (!label) {
        return;
    }
    return {
        label,
        description
    };
}

export const createAndAddQuery = async (context: vscode.ExtensionContext) => {
    const query = await createQuery();
    if (!query) {
        return getQueriesFromStorage(context);
    }
    return addQueryToStorage(query, context);
}


export const formatQueries = (items: SavedQuery[]) => {
    return [
        { 
            label: 'Add Query', 
            description: 'Add a custom query to the list', 
            buttons: [
                {
                    iconPath: new vscode.ThemeIcon('add'),
                    tooltip: 'Add Query',
                }
            ]
        },
        ...(items.length > 0 ? [ {label: '', kind: vscode.QuickPickItemKind.Separator } ] : []),
        ...items.map(item => {
          return {
              ...item,
              buttons: [
                  {
                      iconPath: new vscode.ThemeIcon('trash'),
                      tooltip: 'Delete this query'
                  }
              ],
          };
        })
    ];
}

export const getQueriesFromStorage = (context: vscode.ExtensionContext): SavedQuery[] => {
    const storedItems = context.workspaceState.get<SavedQuery[]>(WORKFLOW_QUERIES, []);
    return storedItems;
}

export const deleteQueryFromStorage = async (label: string, context: vscode.ExtensionContext) => {
    const storedItems = getQueriesFromStorage(context);
    const updatedItems = storedItems.filter(item => item.label !== label);
    await context.workspaceState.update(WORKFLOW_QUERIES, updatedItems);
    return getQueriesFromStorage(context);
};

export const addQueryToStorage = async (item: SavedQuery, context: vscode.ExtensionContext) => {
    const storedItems = getQueriesFromStorage(context);
    const updatedItems = [item, ...storedItems];
    await context.workspaceState.update(WORKFLOW_QUERIES, updatedItems);
    return getQueriesFromStorage(context);
};