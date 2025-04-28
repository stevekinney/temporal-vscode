import * as vscode from 'vscode';
import { ConfigurationKey, ConfigurationValue } from './configuration-schema';

const getConfiguration = <
  K extends ConfigurationKey,
  T = ConfigurationValue<K>,
>(
  key: K,
  section = 'temporal',
) => vscode.workspace.getConfiguration(section).get<T>(key);

export const configuration = {
  get host() {
    return getConfiguration('developmentServer.host') || 'localhost';
  },
  get port() {
    return getConfiguration('developmentServer.port') || 7233;
  },
  get address() {
    return `${this.host}:${this.port}`;
  },
  get ui() {
    const address =
      getConfiguration('developmentServer.webInterface') ||
      'http://localhost:8223';

    return new URL(address);
  },
  get namespace() {
    return getConfiguration('namespace') || 'default';
  },
  get identity() {
    return getConfiguration('client.identity');
  },
  get apiKey() {
    return getConfiguration('connection.apiKey');
  },
  get codecEndpoint() {
    const address = getConfiguration('codecEndpoint');

    if (!address) {
      return;
    }

    return new URL(address);
  },
  get logLevel() {
    return getConfiguration('commandLine.logLevel') || 'error';
  },
};
