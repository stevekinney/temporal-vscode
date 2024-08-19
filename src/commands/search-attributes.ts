import { Command } from '$components/command';
import { VirtualJsonDocument } from '$components/virtual-document';
import { configuration } from '$utilities/configuration';

/**
 * @summary List search attributes
 */
Command.register('getSearchAttributes', async () => {
  VirtualJsonDocument.show(
    `namespaces/${configuration.namespace}/search-attributes`,
  );
});
