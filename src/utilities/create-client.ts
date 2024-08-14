import * as vscode from 'vscode';
import { Connection, Client } from '@temporalio/client';

const configuration = vscode.workspace.getConfiguration('temporal');

export const createClient = async (): Promise<Client> => {
  try {
    const address = configuration.get('address') as string;
    const connection = await Connection.connect({ address });
    const client = new Client({ connection });

    return client;
  } catch (error) {
    throw new Error('Could not connect to Temporal server.');
  }
};
