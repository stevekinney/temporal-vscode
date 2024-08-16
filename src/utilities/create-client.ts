import * as vscode from 'vscode';
import { configuration } from './configuration';
import { Connection, Client } from '@temporalio/client';
import { temporalServer } from '../server';

export const createClient = async (): Promise<Client> => {
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

    const namespace = configuration.namespace;
    const identity = configuration.identity;
    const apiKey = configuration.apiKey;

    const connection = await Connection.connect({ address, apiKey });
    const client = new Client({ connection, namespace, identity });

    return client;
  } catch (error) {
    throw new Error('Could not connect to Temporal server.');
  }
};
