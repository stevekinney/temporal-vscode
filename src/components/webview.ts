import * as vscode from 'vscode';
import { readFile } from 'fs/promises';

import { Component } from './component';

export class Webview extends Component {
  private panel: vscode.WebviewPanel | undefined = undefined;
  private currentColumn: vscode.ViewColumn | undefined = undefined;

  constructor(
    private readonly viewType: ViewName,
    private readonly title: string,
  ) {
    super();
  }

  private get column(): vscode.ViewColumn {
    if (!this.currentColumn) {
      this.currentColumn = vscode.ViewColumn.Beside;
    }

    return this.currentColumn;
  }

  private get html(): Promise<string> {
    const path = this.context.asAbsolutePath(
      `dist/views/${this.viewType}/index.html`,
    );
    return readFile(path, 'utf-8');
  }

  /**
   * Show the webview.
   * @param column The column to show the webview in. Defaults to the active text editor's column.
   * @returns
   */
  async show(column: vscode.ViewColumn = this.column) {
    if (this.panel) {
      this.panel.reveal(column, true);
    } else {
      this.panel = vscode.window.createWebviewPanel(
        this.viewType,
        this.title,
        column,
        {
          enableScripts: true,
          localResourceRoots: [
            vscode.Uri.joinPath(this.context.extensionUri, 'dist'),
          ],
        },
      );

      this.panel.webview.html = await this.html;

      this.panel.onDidDispose(
        () => (this.panel = undefined),
        null,
        this.context.subscriptions,
      );
    }
  }
}
