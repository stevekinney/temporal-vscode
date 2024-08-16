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
      .get('address.webUI');

    return vscode.Uri.parse(`http://${address}`);
  },
  get uiHost() {
    const address = vscode.workspace
      .getConfiguration('temporal')
      .get('address.webUI') as string;

    return address.split(':')[0];
  },
  get uiPort() {
    const address = vscode.workspace
      .getConfiguration('temporal')
      .get('address.webUI') as string;

    return parseInt(address.split(':')[1]);
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
    return vscode.workspace.getConfiguration('temporal').get('APIKey') as
      | string
      | undefined;
  },
};
