import * as vscode from 'vscode';

export const extensionId = 'temporal-vscode';

export const setContext = (context: vscode.ExtensionContext) => {
  Component.context = context;
};

export class Component {
  static context: vscode.ExtensionContext | null = null;
  static extensionId = extensionId;

  protected get context(): vscode.ExtensionContext {
    if (!Component.context) {
      throw new Error('Component.context is not set');
    }

    return Component.context;
  }

  get extensionUri() {
    return this.context.extensionUri;
  }

  constructor() {
    if (!Component.context) {
      throw new Error('Component.context is not set');
    }
  }
}
