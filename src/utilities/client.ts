import * as vscode from 'vscode';
import { Connection, Client } from '@temporalio/client';
import { configuration } from './configuration';
import { temporalServer } from '../server';

export type TemporalClient = Client;
export type CreateClient = () => Promise<TemporalClient>;
export type WithClient = (
  fn: (client: TemporalClient) => Promise<void> | void,
) => void;

export const createClient: CreateClient = async () => {
  try {
    const serverRunning = await temporalServer.isRunning();

    if (!serverRunning) {
      const result = await vscode.window.showErrorMessage(
        'The Temporal server is not running. Please start the server and try again.',
        'Start Development Server',
      );

      if (result === 'Start Development Server') {
        await temporalServer.start();
      } else {
        throw new Error('The Temporal server is not running.');
      }
    }

    const address = configuration.address;
    const apiKey = configuration.apiKey;
    const namespace = configuration.namespace;
    const identity = configuration.identity;

    const connection = await Connection.connect({ address, apiKey });
    const client = new Client({ connection, namespace, identity });

    return client;
  } catch (error) {
    throw new Error('Could not connect to Temporal server.');
  }
};

export const withClient: WithClient = async (fn) => {
  const client = await createClient();

  try {
    await fn(client);
  } finally {
    client.connection.close();
  }
};
