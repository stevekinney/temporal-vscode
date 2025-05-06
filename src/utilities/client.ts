import * as vscode from 'vscode';
import {
  Connection,
  Client,
  ConnectionOptions,
  ClientOptions,
} from '@temporalio/client';
import { configuration } from './configuration';
import { temporalServer } from '../server';

export type TemporalClient = Client;
export type CreateClient = (
  options?: Partial<ClientOptions>,
) => Promise<TemporalClient>;
export type WithClient = <T>(
  fn: (client: TemporalClient) => Promise<T> | T,
) => Promise<T>;

/**
 * Creates a new Temporal client with the configured settings
 */
export const createClient: CreateClient = async (customOptions = {}) => {
  try {
    // Check if server is running and prompt to start if not
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

    // Prepare connection options from configuration
    const connectionOptions: ConnectionOptions = {
      address: configuration.address,
    };

    if (configuration.apiKey) {
      connectionOptions.apiKey = configuration.apiKey;
    }

    // Create connection
    const connection = await Connection.connect(connectionOptions);

    // Prepare client options
    const clientOptions: ClientOptions = {
      connection,
      namespace: configuration.namespace,
      ...customOptions,
    };

    if (configuration.identity) {
      clientOptions.identity = configuration.identity;
    }

    // Create and return client
    return new Client(clientOptions);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Could not connect to Temporal server.');
  }
};

/**
 * Executes a function with a client and automatically closes the connection
 */
export const withClient: WithClient = async <T>(
  fn: (client: TemporalClient) => Promise<T> | T,
): Promise<T> => {
  const client = await createClient();

  try {
    return await fn(client);
  } finally {
    await client.connection.close();
  }
};
