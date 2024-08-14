import * as vscode from 'vscode';
import { Connection, Client } from '@temporalio/client';

const configuration = vscode.workspace.getConfiguration('temporal');

export const createClient = async (): Promise<Client> => {
  try {
    const address = configuration.get('address') as string;
    const namespace = configuration.get('namespace') as string;
    const identity = configuration.get('identity') as string | undefined;
    const apiKey = configuration.get('APIKey') as string | undefined;

    const connection = await Connection.connect({ address, apiKey });
    const client = new Client({ connection, namespace, identity });

    return client;
  } catch (error) {
    throw new Error('Could not connect to Temporal server.');
  }
};
