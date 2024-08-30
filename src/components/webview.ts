import * as vscode from 'vscode';
import { readFile } from 'fs/promises';

export class Webview {
  static context: vscode.ExtensionContext;

  private panel: vscode.WebviewPanel | undefined = undefined;

  constructor(
    private readonly viewType: ViewName,
    private readonly title: string,
  ) {}

  private get context(): vscode.ExtensionContext {
    if (!Webview.context) {
      throw new Error('Webview.context is not set');
    }

    return Webview.context;
  }

  private get column(): vscode.ViewColumn {
    return vscode.window.activeTextEditor?.viewColumn || vscode.ViewColumn.One;
  }

  /**
   * Show the webview.
   * @param column The column to show the webview in. Defaults to the active text editor's column.
   * @returns
   */
  async show(column: vscode.ViewColumn = this.column) {
    console.log(
      this.context.asAbsolutePath(`dist/views/${this.viewType}/assets`),
      vscode.Uri.joinPath(
        this.context.extensionUri,
        `dist/views/${this.viewType}/assets`,
      ).toString(),
    );

    if (this.panel) {
      this.panel.reveal(column);
      return;
    } else {
      this.panel = vscode.window.createWebviewPanel(
        this.viewType,
        this.title,
        column,
        {
          enableScripts: true,
          localResourceRoots: [
            vscode.Uri.joinPath(
              this.context.extensionUri,
              'dist',
              'views',
              this.viewType,
              'assets',
            ),
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

  private get html(): Promise<string> {
    const path = this.context.asAbsolutePath(
      `dist/views/${this.viewType}/index.html`,
    );
    return readFile(path, 'utf-8');
  }
}
