import * as vscode from 'vscode';
import { Component } from './component';
import { camelCase } from 'change-case';
import { z } from 'zod';

type WebviewOptions = vscode.WebviewPanelOptions &
  vscode.WebviewOptions & {
    viewType?: string;
    viewColumn?: vscode.ViewColumn;
    preserveFocus?: boolean;
    messageSchema?: z.Schema;
    html?: string;
    hide?: boolean;
  };

type ViewStateChangeListener = (
  e: vscode.WebviewPanelOnDidChangeViewStateEvent,
) => void;

type MessageListener = (
  e: vscode.WebviewPanelOnDidChangeViewStateEvent,
) => void;

type DisposalListener = () => void;

/**
 * A class that represents a webview panel in Visual Studio Code.
 * It provides methods to create, manage, and dispose of the webview panel.
 * It also provides methods to set timeouts and intervals that are automatically cleared when the webview is disposed.
 * It's effectively a wrapper around the `vscode.WebviewPanel` and `vscode.Webview` classes.
 */
export class Webview
  extends Component
  implements vscode.WebviewPanel, vscode.Webview
{
  /** The title of the webview panel. */
  title: string;
  /** The type of the webview panel. */
  viewType: string;
  /** The view column in which the webview panel is displayed. */
  viewColumn: vscode.ViewColumn;
  /** Whether the webview panel should preserve focus when revealed. */
  preserveFocus?: boolean;
  /** Whether the webview panel should be created at initialization. */
  options: vscode.WebviewPanelOptions & vscode.WebviewOptions;
  /** Zod schema to validate messages sent to the webview. */
  messageSchema: z.Schema;
  /** The HTML content of the webview panel. */
  html: string = '';

  #panel: vscode.WebviewPanel | null = null;
  #intervals: Set<NodeJS.Timeout> = new Set();
  #timeouts: Set<NodeJS.Timeout> = new Set();
  #dispoalListeners: Set<DisposalListener> = new Set();
  #viewStateChangeListeners: Set<ViewStateChangeListener> = new Set();
  #messageListeners: Set<MessageListener> = new Set();

  constructor(
    title: string,
    {
      viewType = camelCase(title),
      viewColumn = vscode.ViewColumn.Active,
      preserveFocus,
      messageSchema,
      hide = false,
      html = '',
      ...options
    }: WebviewOptions = {},
  ) {
    super();

    this.title = title;
    this.viewType = viewType;
    this.viewColumn = vscode.ViewColumn.Active;
    this.preserveFocus = preserveFocus;
    this.messageSchema = messageSchema || z.any();
    this.html = html;
    this.options = options;

    if (!hide) this.reveal(viewColumn, preserveFocus);
  }

  /**
   * Whether the panel is active (focused by the user).
   * This property is `true` if the panel is currently active and `false` otherwise.
   */
  get active(): boolean {
    return this.#panel?.active ?? false;
  }

  /**
   * Whether the panel is visible.
   * This property is `true` if the panel is currently visible and `false` otherwise.
   */
  get visible(): boolean {
    return this.#panel?.visible ?? false;
  }

  /**
   * `Webview` belonging to the panel.
   * This is the webview that is displayed in the panel.
   * @throws Error if the panel is not created yet.
   */
  get webview(): vscode.Webview {
    if (!this.#panel) {
      throw new Error(`Webview panel (${this.title}) is not created yet`);
    }
    return this.#panel.webview;
  }

  /**
   * The URI that can be used to access the webview's content.
   * This is the URI that can be used to access the webview's content.
   * @throws Error if the panel is not created yet.
   */
  get cspSource(): string {
    if (!this.#panel) {
      throw new Error(`Webview panel (${this.title}) is not created yet`);
    }
    return this.#panel.webview.cspSource;
  }

  /**
   * The URI that can be used to access the webview's content.
   * This is the URI that can be used to access the webview's content.
   * @throws Error if the panel is not created yet.
   */
  get asWebviewUri(): (uri: vscode.Uri) => vscode.Uri {
    if (!this.#panel) {
      throw new Error(`Webview panel (${this.title}) is not created yet`);
    }
    return this.#panel.webview.asWebviewUri;
  }

  /**
   *
   * @param viewColumn - The view column to show the webview in. If not provided, it will use the current view column.
   * @param options - Additional options for the webview panel.
   * @returns
   */
  reveal(
    viewColumn = this.viewColumn,
    preserveFocus?: boolean,
  ): vscode.WebviewPanel {
    if (this.#panel) {
      this.#panel.reveal(viewColumn, preserveFocus);
      return this.#panel;
    }

    const panel = vscode.window.createWebviewPanel(
      this.viewType,
      this.title,
      { viewColumn, preserveFocus },
      this.options,
    );

    for (const listener of this.#viewStateChangeListeners) {
      panel.onDidChangeViewState(listener);
    }

    for (const listener of this.#dispoalListeners) {
      panel.onDidDispose(listener);
    }

    for (const listener of this.#messageListeners) {
      panel.webview.onDidReceiveMessage(listener);
    }

    panel.onDidDispose(() => {
      this.dispose();
    });

    return panel;
  }

  /**
   * Post a message to the webview content.
   * Messages are only sent if the webview is live (either visible or in the background with `retainContextWhenHidden`).
   *
   * The message is validated against the provided Zod schema, `this.messageSchema`.
   * If the message is not valid, an error is thrown.
   *
   * @param message
   * @returns
   */
  postMessage(message: z.infer<typeof this.messageSchema>) {
    const panel = this.#panel || this.reveal();
    return panel.webview.postMessage(message);
  }

  /**
   * Executes a function after a specified delay.
   * This method is similar to the built-in `setTimeout` function, but it also keeps track of the timeouts created.
   * It allows you to clear all timeouts when the webview is disposed.
   * @param fn - The function to execute after the delay.
   * @param delay - The delay in milliseconds before executing the function.
   * @param args - The arguments to pass to the function when it is executed
   */
  setTimeout(
    fn: (...args: any[]) => void,
    delay: number,
    ...args: any[]
  ): NodeJS.Timeout {
    const timeout = setTimeout(() => {
      fn(...args);
      this.#timeouts.delete(timeout);
    }, delay);
    this.#timeouts.add(timeout);
    return timeout;
  }

  /**
   * Clears the specified timeout.
   * This method is similar to the built-in `clearTimeout` function, but it also removes the timeout from the set of timeouts.
   * @param timeout - The timeout to clear.
   */
  clearTimeout(timeout: NodeJS.Timeout): void {
    clearTimeout(timeout);
    this.#timeouts.delete(timeout);
  }

  /**
   * Executes a function on a regular interval.
   * This method is similar to the built-in `setInterval` function, but it also keeps track of the timeouts created.
   * It allows you to clear all timeouts when the webview is disposed.
   * @param fn - The function to execute after the delay.
   * @param delay - The delay in milliseconds before executing the function.
   * @param args - The arguments to pass to the function when it is executed
   */
  setInterval(
    fn: (...args: any[]) => void,
    delay: number,
    ...args: any[]
  ): NodeJS.Timeout {
    const interval = setInterval(() => {
      fn(...args);
    }, delay);
    this.#intervals.add(interval);
    return interval;
  }

  /**
   * Clears the specified interval.
   * This method is similar to the built-in `clearInterval` function, but it also removes the interval from the set of intervals.
   * @param interval - The interval to clear.
   */
  clearInterval(interval: NodeJS.Timeout): void {
    clearInterval(interval);
    this.#intervals.delete(interval);
  }

  onDidReceiveMessage(listener: MessageListener): vscode.Disposable {
    this.#messageListeners.add(listener);

    const disposable = new vscode.Disposable(() => {
      this.#messageListeners.delete(listener);
    });

    return {
      dispose: () => {
        this.#messageListeners.delete(listener);
        disposable.dispose();
      },
    };
  }

  /**
   * Registers a listener that is invoked whenever the webview panel's view state changes.
   */
  onDidChangeViewState(listener: ViewStateChangeListener): vscode.Disposable {
    this.#viewStateChangeListeners.add(listener);

    const disposable = new vscode.Disposable(() => {
      this.#viewStateChangeListeners.delete(listener);
    });

    return {
      dispose: () => {
        this.#viewStateChangeListeners.delete(listener);
        disposable.dispose();
      },
    };
  }

  /**
   * Close the webview panel and clean up resources.
   * This method is called when the webview is no longer needed.
   * It disposes of the webview and clears any intervals or timeouts.
   * It should be called when the webview is closed or when the extension is deactivated.
   */
  dispose(): void {
    this.#panel?.dispose();
    this.#panel = null;

    for (const timeout of this.#timeouts) {
      this.clearTimeout(timeout);
    }

    for (const interval of this.#intervals) {
      this.clearInterval(interval);
    }

    this.#timeouts.clear();
    this.#intervals.clear();
  }

  onDidDispose(listener: DisposalListener) {
    this.#dispoalListeners.add(listener);

    const disposable = new vscode.Disposable(() => {
      this.#viewStateChangeListeners.delete(listener);
    });

    return {
      dispose: () => {
        this.#viewStateChangeListeners.delete(listener);
        disposable.dispose();
      },
    };
  }
}
