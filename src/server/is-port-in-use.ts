import net from 'node:net';
import { configuration } from '../utilities/configuration';

/**
 * Checks if the port is in use.
 * @param port The port number to check.
 * @param host The host to check against.
 * @returns A promise that resolves to true if the port is in use, false otherwise.
 */
export const isPortInUse = async (
  port: number = configuration.port,
  host: string = configuration.host,
) => {
  return new Promise<boolean>((resolve) => {
    try {
      const server = net
        .createServer()
        .once('error', () => {
          resolve(true);
        })
        .once('listening', () =>
          server
            .once('close', () => {
              resolve(false);
            })
            .close(),
        )
        .listen(port, host);
    } catch (error) {
      resolve(false);
    }
  });
};
