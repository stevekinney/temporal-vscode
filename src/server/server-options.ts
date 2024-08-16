import { configuration } from '../utilities/configuration';

export const getServerOptions = () => {
  return {
    '--ip': configuration.host,
    '--port': configuration.port,
    '--ui-ip': configuration.ui.hostname,
    '--ui-port': configuration.ui.port,
    '--log-level': configuration.logLevel,
    '--ui-codec-endpoint': configuration.codecEndpoint?.href,
  } as const;
};

export const getServerCommand = () => {
  const options = getServerOptions();

  return `temporal server start-dev ${Object.entries(options)
    .map(([key, value]) => {
      if (value) {
        return `${key} ${value}`;
      }
      return '';
    })
    .join(' ')}`;
};
