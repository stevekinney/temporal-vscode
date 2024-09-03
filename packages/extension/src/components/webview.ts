import { window, Uri, ViewColumn, type WebviewPanel } from 'vscode';
import { getNonce } from '$utilities/get-nonce';

import './style.css';

import { Component } from './component';

const options = {
  enableScripts: true,
} as const;

export class Webview extends Component {
  static readonly viewType = 'temporal.webview';

  static show(title: string): Webview {
    return new Webview(title).show();
  }

  private _panel: WebviewPanel | undefined = undefined;
  private currentColumn: ViewColumn | undefined = undefined;
  private viewType = Webview.viewType;

  private constructor(private readonly title: string) {
    super();
  }

  get panel(): WebviewPanel {
    if (!this._panel) {
      this._panel = window.createWebviewPanel(
        this.viewType,
        this.title,
        this.column,
        options,
      );
    }

    return this._panel;
  }

  get column(): ViewColumn {
    if (!this.currentColumn) {
      this.currentColumn = ViewColumn.Beside;
    }

    return this.currentColumn;
  }

  getUri(...path: string[]) {
    return this.panel.webview.asWebviewUri(
      Uri.joinPath(this.context.extensionUri, 'dist', ...path),
    );
  }

  getHtml() {
    const styleUri = this.getUri('extension.css');

    return `
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${this.title}</title>
          <link href="${styleUri}" rel="stylesheet" />
        </head>
        <body>
          <h1>Start Workflow</h1>
          <form method="post">
            <label for="workflowId">Workflow ID</label>
            <input type="text" id="workflowId" name="workflowId" />

            <label for="workflowType">Workflow Type</label>
            <input type="text" id="workflowType" name="workflowType" />

            <label for="taskQueue">Task Queue</label>
            <input type="text" id="taskQueue" name="taskQueue" />

            <label for="input">Input</label>
            <textarea id="input" name="input"></textarea>

            <button type="submit">Submit</button>
          </form>
        </body>
      </html>
    `;
  }

  /**
   * Show the webview.
   * @param column The column to show the webview in. Defaults to the active text editor's column.
   */
  show() {
    this.panel.webview.html = this.getHtml();
    this.panel.reveal(this.column);

    return this;
  }
}
