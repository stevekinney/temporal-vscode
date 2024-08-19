import { Command } from '$components/command';
import { VirtualJsonDocument } from '$components/virtual-document';

/**
 * @summary Get system information
 */
Command.register('getSystemInfo', async () => {
  VirtualJsonDocument.show('system-info');
});

/**
 * @summary Get cluster information
 */
Command.register('getClusterInfo', async () => {
  VirtualJsonDocument.show('cluster-info');
});
