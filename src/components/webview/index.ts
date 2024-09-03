import { window, ViewColumn, type WebviewPanel } from 'vscode';

import { Component } from '../component';

import { getWebviewHtml } from './get-webview-html';
import developmentView from './development-view.html';

const options = {
  enableScripts: true,
} as const;

export class Webview extends Component {
  static webview: Webview | undefined;

  static async show(title: ViewName): Promise<Webview> {
    if (!Webview.webview) {
      Webview.webview = new Webview(title);
    } else {
      Webview.webview.title = title;
    }

    return Webview.webview.show();
  }

  private readonly panel: WebviewPanel;
  private readonly viewType = 'temporal.webview';
  private currentColumn: ViewColumn | undefined;

  private constructor(protected title: ViewName) {
    super();

    this.panel = window.createWebviewPanel(
      this.viewType,
      this.title,
      this.column,
      options,
    );
  }

  private get postMessage() {
    return this.panel.webview.postMessage.bind(this.panel.webview);
  }

  get column(): ViewColumn {
    if (!this.currentColumn) {
      this.currentColumn =
        window.activeTextEditor?.viewColumn ?? ViewColumn.One;
    }

    return this.currentColumn;
  }

  get html() {
    if (process.env.NODE_ENV !== 'production') {
      return developmentView;
    }

    return getWebviewHtml(this.panel, this.context.extensionUri);
  }

  /**
   * Show the webview.
   * @param column The column to show the webview in. Defaults to the active text editor's column.
   */
  show() {
    const html = this.html;

    if (this.panel.webview.html !== html) {
      this.panel.webview.html = html;
    }

    this.panel.reveal(this.column);

    return this;
  }
}
