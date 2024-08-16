import * as vscode from 'vscode';

export const configuration = {
  get address() {
    return vscode.workspace
      .getConfiguration('temporal')
      .get('address.server') as string;
  },
  get host() {
    return this.address.split(':')[0];
  },
  get port() {
    return parseInt(this.address.split(':')[1]);
  },
  get ui() {
    const address = vscode.workspace
      .getConfiguration('temporal')
      .get('address.webUI') as string;

    return new URL(address);
  },
  get namespace() {
    return vscode.workspace
      .getConfiguration('temporal')
      .get('namespace') as string;
  },
  get identity() {
    return vscode.workspace.getConfiguration('temporal').get('identity') as
      | string
      | undefined;
  },
  get apiKey() {
    return vscode.workspace.getConfiguration('temporal').get('apiKey') as
      | string
      | undefined;
  },
  get codecEndpoint() {
    const address = vscode.workspace
      .getConfiguration('temporal')
      .get('address.codecEndpoint') as string;

    return new URL(address);
  },
};
