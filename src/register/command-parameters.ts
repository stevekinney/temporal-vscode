import * as vscode from 'vscode';
import { createClient, type TemporalClient } from '$utilities/create-client';
import { openUI } from '$utilities/open-ui';

export class CommandParameters {
  public openUI = openUI;
  public context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  getClient(): Promise<TemporalClient> {
    return createClient();
  }
}
