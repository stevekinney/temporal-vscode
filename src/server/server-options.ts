import { configuration } from '../utilities/configuration';

const serverOptions = {
  get '--ip'() {
    return configuration.host;
  },
  get '--port'() {
    return configuration.port;
  },
  get '--ui-ip'() {
    return configuration.ui.hostname;
  },
  get '--ui-port'() {
    return configuration.ui.port;
  },
  get '--log-level'() {
    return configuration.logLevel;
  },
  get '--ui-codec-endpoint'() {
    return configuration.codecEndpoint?.href;
  },

  toString() {
    let options = '';
    for (const [key, value] of Object.entries(this)) {
      if (key.startsWith('--') && value) {
        options += `${key} ${value} `;
      }
    }
    return options.trim();
  },
};

export const getServerCommand = () => {
  return `temporal server start-dev ${serverOptions}`;
};
