import { window, type Terminal } from 'vscode';
import { registerCommand } from '$register';
import { configuration } from '$utilities/configuration';
import { isPortInUse } from './is-port-in-use';
import { getServerCommand } from './server-options';

let terminal: Terminal | undefined;

const terminalName = 'Temporal Development Server';

const createTerminal = () => {
  return window.createTerminal(terminalName);
};

const findTerminal = () => {
  return window.terminals.find((terminal) => terminal.name === terminalName);
};

export const onTerminalChanges = () => {
  return [
    window.onDidCloseTerminal((closedTerminal) => {
      if (closedTerminal.name === terminalName) {
        terminal = undefined;
      }
    }),

    window.onDidOpenTerminal((openedTerminal) => {
      if (openedTerminal.name === terminalName) {
        terminal = openedTerminal;
      }
    }),
  ];
};

export const temporalServer = {
  isRunning: isPortInUse,

  get terminal(): Terminal {
    if (!terminal) {
      terminal = findTerminal() || createTerminal();
    }

    return terminal;
  },

  set terminal(value: Terminal | undefined) {
    terminal = value;
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

    this.terminal.sendText(command);
    this.terminal.show();

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

    if (!this.terminal) {
      window.showErrorMessage(
        'No terminal found. Your Temporal server may be running outside of Visual Studio Code.',
      );
      return;
    }

    this.terminal.sendText('\x03');
    this.terminal.dispose();
    this.terminal = undefined;

    window.showInformationMessage('Temporal server stopped.');
  },
};

export const startDevelopmentServer = () => temporalServer.start();
export const stopDevelopmentServer = () => temporalServer.start();
