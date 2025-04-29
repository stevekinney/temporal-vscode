import * as vscode from 'vscode';

import { Component } from './component';
import which from 'which';

export interface TerminalOptions extends vscode.TerminalOptions {
  name: string;
}

export class Terminal extends Component {
  static async getTemporalCli(): Promise<string> {
    try {
      const cli = await which('temporal');
      return cli;
    } catch (error) {
      throw new Error(
        'Temporal CLI not found. Please install it or add it to your PATH.',
      );
    }
  }
  }

  /**
   * Finds an existing terminal by name
   * @param name The name of the terminal to find
   * @returns The terminal instance or undefined if not found
   */
  static find(name: string): vscode.Terminal | undefined {
    return vscode.window.terminals.find((terminal) => terminal.name === name);
  }

  private terminal: vscode.Terminal | undefined = undefined;
  private options: TerminalOptions;

  /**
   * Creates a new terminal instance
   * @param name The name of the terminal
   * @param options Optional terminal configuration options
   */
  constructor(name: string, options?: Partial<Omit<TerminalOptions, 'name'>>) {
    super();
    this.options = { name, ...options };
    this.bindEvents();
  }

  /**
   * Gets the terminal instance, creating it if necessary
   * @throws Error if terminal creation fails
   */
  get instance(): vscode.Terminal {
    try {
      if (!this.terminal) {
        this.terminal =
          Terminal.find(this.options.name) ||
          vscode.window.createTerminal(this.options);
      }

      return this.terminal;
    } catch (error) {
      throw new Error(
        `Failed to create or access terminal: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Shows the terminal in the editor
   * @returns This terminal instance for chaining
   */
  show(): Terminal {
    try {
      this.instance.show();
      return this;
    } catch (error) {
      console.error('Failed to show terminal:', error);
      return this;
    }
  }

  /**
   * Sends text to the terminal
   * @param text The text to send
   * @returns This terminal instance for chaining
   */
  sendText(text: string): Terminal {
    try {
      this.instance.sendText(text);
      return this;
    } catch (error) {
      console.error('Failed to send text to terminal:', error);
      return this;
    }
  }

  /**
   * Sends a cancellation signal (Ctrl+C) to the terminal
   * @returns This terminal instance for chaining
   */
  sendCancellation(): Terminal {
    try {
      if (this.terminal) {
        this.terminal.sendText('\x03');
      }
      return this;
    } catch (error) {
      console.error('Failed to send cancellation to terminal:', error);
      return this;
    }
  }

  /**
   * Clears the terminal content
   * @returns This terminal instance for chaining
   */
  clear(): Terminal {
    try {
      this.instance.sendText('clear', true);
      return this;
    } catch (error) {
      console.error('Failed to clear terminal:', error);
      return this;
    }
  }

  /**
   * Disposes the terminal
   */
  dispose(): void {
    try {
      if (this.terminal) {
        this.terminal.dispose();
        this.terminal = undefined;
      }
    } catch (error) {
      console.error('Failed to dispose terminal:', error);
    }
  }

  /**
   * Binds event listeners for terminal lifecycle events
   */
  private bindEvents(): void {
    this.context.subscriptions.push(
      vscode.window.onDidCloseTerminal((closedTerminal) => {
        if (closedTerminal.name === this.options.name) {
          this.terminal = undefined;
        }
      }),
    );

    this.context.subscriptions.push(
      vscode.window.onDidOpenTerminal((openedTerminal) => {
        if (openedTerminal.name === this.options.name) {
          this.terminal = openedTerminal;
        }
      }),
    );
  }
}
