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

  /**
   * Creates a command string with the Temporal CLI and arguments
   * @param command The command to run
   * @param args Optional arguments for the command
   * @returns Promise with the full command string
   */
  static async buildCommand(command: string, args: string[] = []): Promise<string> {
    const cli = await Terminal.getTemporalCli();
    return [cli, command, ...args].filter(Boolean).join(' ');
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
   * @param addNewLine Whether to add a new line after the text (defaults to true)
   * @returns This terminal instance for chaining
   */
  sendText(text: string, addNewLine = true): Terminal {
    try {
      this.instance.sendText(text, addNewLine);
      return this;
    } catch (error) {
      console.error('Failed to send text to terminal:', error);
      return this;
    }
  }
  
  /**
   * Executes a Temporal CLI command
   * @param command The command to run
   * @param args Command arguments
   * @returns This terminal instance for chaining
   */
  async executeCommand(command: string, args: string[] = []): Promise<Terminal> {
    try {
      const fullCommand = await Terminal.buildCommand(command, args);
      this.instance.sendText(fullCommand);
      return this;
    } catch (error) {
      console.error(`Failed to execute command "${command}":`, error);
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
