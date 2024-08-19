import * as vscode from 'vscode';

const findTerminal = (name: string): vscode.Terminal | undefined => {
  return vscode.window.terminals.find((terminal) => terminal.name === name);
};

export class Terminal {
  static context: vscode.ExtensionContext;

  private terminal: vscode.Terminal | undefined = undefined;

  constructor(private readonly name: string) {
    if (!Terminal.context) {
      throw new Error('Terminal.context is not set');
    }

    this.bindEvents();
  }

  get instance(): vscode.Terminal {
    if (!this.terminal) {
      this.terminal =
        findTerminal(this.name) || vscode.window.createTerminal(this.name);
    }

    return this.terminal;
  }

  get context(): vscode.ExtensionContext {
    return Terminal.context;
  }

  show() {
    this.instance.show();
  }

  sendText(text: string) {
    this.instance.sendText(text);
    return this.instance;
  }

  sendCancellation() {
    if (this.terminal) {
      this.terminal.sendText('\x03');
    }
    return this.terminal;
  }

  dispose() {
    if (this.terminal) {
      this.terminal.dispose();
      this.terminal = undefined;
    }
  }

  private bindEvents() {
    this.context.subscriptions.push(
      vscode.window.onDidCloseTerminal((closedTerminal) => {
        if (closedTerminal.name === this.name) {
          this.terminal = undefined;
        }
      }),
    );

    this.context.subscriptions.push(
      vscode.window.onDidOpenTerminal((openedTerminal) => {
        if (openedTerminal.name === this.name) {
          this.terminal = openedTerminal;
        }
      }),
    );
  }
}
