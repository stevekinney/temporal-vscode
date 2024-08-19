import { Command } from '$components/command';
import { VirtualJsonDocument } from '$components/virtual-document';

Command.register('getSystemInfo', async () => {
  VirtualJsonDocument.show('system-info');
});

Command.register('getClusterInfo', async () => {
  VirtualJsonDocument.show('cluster-info');
});
