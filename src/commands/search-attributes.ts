import { Command } from '$components/command';
import { VirtualJsonDocument } from '$components/virtual-document';
import { configuration } from '$utilities/configuration';

Command.register('getSearchAttributes', async () => {
  VirtualJsonDocument.show(
    `namespaces/${configuration.namespace}/search-attributes`,
  );
});
