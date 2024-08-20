import * as vscode from 'vscode';

const getConfiguration = <T = string | undefined>(
  key: string,
  section: string = 'temporal',
) => vscode.workspace.getConfiguration(section).get<T>(key);

export const configuration = {
  get address() {
    return getConfiguration('address.server') || 'localhost:7233';
  },
  get host() {
    return this.address.split(':')[0];
  },
  get port() {
    return parseInt(this.address.split(':')[1]);
  },
  get ui() {
    const address =
      getConfiguration<string>('address.webUI') || 'http://localhost:8233';

    return new URL(address);
  },
  get namespace() {
    return getConfiguration<string>('namespace') || 'default';
  },
  get identity() {
    return getConfiguration<string>('identity');
  },
  get apiKey() {
    return getConfiguration<string | undefined>('apiKey');
  },
  get codecEndpoint() {
    const address = getConfiguration('address<string>.codecEndpoint');

    if (!address) {
      return;
    }

    return new URL(address);
  },
  get logLevel() {
    const logLevel = getConfiguration<string>('logLevel') || 'error';

    return logLevel;
  },
};
