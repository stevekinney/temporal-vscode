import { window } from 'vscode';
import { configuration } from '$utilities/configuration';
import { isPortInUse } from './is-port-in-use';
import { getServerCommand } from './server-options';
import { Terminal } from '$components/terminal';
import { Command } from '$components/command';

let terminal: Terminal | undefined;

export const temporalServer = {
  isRunning: isPortInUse,

  get terminal(): Terminal {
    if (!terminal) {
      terminal = new Terminal('Temporal Server');
    }
    return terminal;
  },

  async start(): Promise<void> {
    const running = await temporalServer.isRunning();

    if (running) {
      window.showErrorMessage(
        `A process is already running on ${configuration.address}.`,
      );
      return;
    }

    const command = getServerCommand();

    this.terminal.sendText(command).show();

    window.showInformationMessage('Temporal server started.');
  },

  async stop(): Promise<void> {
    const running = await temporalServer.isRunning();

    if (!running) {
      window.showErrorMessage(
        `No process is running on ${configuration.address}.`,
      );
      return;
    }

    this.terminal.sendCancellation();
    this.terminal.dispose();

    window.showInformationMessage('Temporal server stopped.');
  },
};

/** @summary Start development server */
Command.register('startDevelopmentServer', () => temporalServer.start());

/** @summary Stop development server */
Command.register('stopDevelopmentServer', () => temporalServer.stop());
