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

/**
 * A listener for the webview panel's view state change event.
 * This event is fired when the view state of the webview panel changes.
 * For example, when the panel is activated or deactivated.
 * The listener receives an event object that contains information about the view state change.
 */
type ViewStateChangeListener = (
  e: vscode.WebviewPanelOnDidChangeViewStateEvent,
) => void;

/**
 * A listener for the webview panel's message event.
 * This event is fired when a message is received from the webview.
 * The listener receives an event object that contains the message data.
 */
type MessageListener = (message: any) => void;

/**
 * A listener for the webview panel's disposal event.
 * This event is fired when the webview panel is disposed.
 * The listener receives an event object that contains information about the disposal.
 */
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
  #disposalListeners: Set<DisposalListener> = new Set();
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
    this.viewColumn = viewColumn;
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
   * The Content Security Policy source for the webview.
   * @throws Error if the panel is not created yet.
   */
  get cspSource(): string {
    if (!this.#panel) {
      throw new Error(`Webview panel (${this.title}) is not created yet`);
    }
    return this.#panel.webview.cspSource;
  }

  /**
   * Function to convert a URI for use within the webview.
   * This allows resources to be loaded within the webview context.
   * @throws Error if the panel is not created yet.
   */
  get asWebviewUri(): (uri: vscode.Uri) => vscode.Uri {
    if (!this.#panel) {
      throw new Error(`Webview panel (${this.title}) is not created yet`);
    }
    return this.#panel.webview.asWebviewUri;
  }

  /**
   * Creates and reveals the webview panel if it doesn't exist, or reveals an existing panel.
   * @param viewColumn - The view column to show the webview in. If not provided, it will use the current view column.
   * @param preserveFocus - Whether to preserve focus on the current editor after revealing.
   * @returns The webview panel instance.
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

    if (!panel.webview.html) {
      panel.webview.html = this.html;
    }

    for (const listener of this.#viewStateChangeListeners) {
      panel.onDidChangeViewState(listener);
    }

    for (const listener of this.#disposalListeners) {
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
    // Remove the panel first to prevent further event triggers
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

    // Clear all listener sets
    this.#disposalListeners.clear();
    this.#viewStateChangeListeners.clear();
    this.#messageListeners.clear();
  }

  onDidDispose(listener: DisposalListener) {
    this.#disposalListeners.add(listener);

    const disposable = new vscode.Disposable(() => {
      this.#disposalListeners.delete(listener);
    });

    return {
      dispose: () => {
        this.#disposalListeners.delete(listener);
        disposable.dispose();
      },
    };
  }
}
