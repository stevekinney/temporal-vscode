import { Command } from '$components/command';
import { ApiResponse } from '$components/virtual-document';

/**
 * @summary Get system information
 */
Command.register('getSystemInfo', async () => {
  ApiResponse.show('system-info');
});

/**
 * @summary Get cluster information
 */
Command.register('getClusterInfo', async () => {
  ApiResponse.show('cluster-info');
});
