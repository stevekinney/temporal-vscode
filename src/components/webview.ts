import * as vscode from 'vscode';

export class Webview {
  static context: vscode.ExtensionContext;

  private panel: vscode.WebviewPanel | undefined = undefined;
  public content: string = '';

  constructor(
    private readonly viewType: string,
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
  show(column: vscode.ViewColumn = this.column) {
    if (this.panel) {
      this.panel.reveal(column);
      return;
    } else {
      this.panel = vscode.window.createWebviewPanel(
        this.viewType,
        this.title,
        column,
        {},
      );

      this.panel.webview.html = this.content;

      this.panel.onDidDispose(
        () => (this.panel = undefined),
        null,
        this.context.subscriptions,
      );
    }
  }
}
