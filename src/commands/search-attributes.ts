import * as vscode from 'vscode';
import { Command } from '$components/command';
import { html, render, each } from '$utilities/html';

let currentPanel: vscode.WebviewPanel | undefined = undefined;

const searchAttributeTypes = [
  'Unspecified',
  'Text',
  'Keyword',
  'Integer',
  'Double',
  'Boolean',
  'DateTime',
  'KeywordList',
];

Command.register('getSearchAttributes', async ({ getClient, context }) => {
  const client = await getClient();
  const { namespace } = client.options;

  const result = await client.workflowService.getSearchAttributes({
    namespace,
  });

  const content = html`
    <table>
      ${each(
        result.keys as Record<string, number>,
        (key, value) =>
          html`<tr>
            <td>${key}</td>
            <td>${value && searchAttributeTypes[value]}</td>
          </tr>`,
      )}
    </table>
  `;

  const columnToShowIn = vscode.window.activeTextEditor
    ? vscode.window.activeTextEditor.viewColumn
    : undefined;

  if (currentPanel) {
    currentPanel.reveal(columnToShowIn);
    return;
  } else {
    currentPanel = vscode.window.createWebviewPanel(
      'searchAttributes',
      'Temporal: Search Attributes',
      columnToShowIn || vscode.ViewColumn.One,
      {},
    );

    currentPanel.webview.html = render(content);

    currentPanel.onDidDispose(
      () => (currentPanel = undefined),
      null,
      context.subscriptions,
    );
  }
});
