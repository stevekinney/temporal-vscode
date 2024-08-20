import { Command } from '$components/command';
import { ApiResponse } from '$components/virtual-document';
import { configuration } from '$utilities/configuration';

/**
 * @summary List search attributes
 */
Command.register('getSearchAttributes', async () => {
  ApiResponse.show(`namespaces/${configuration.namespace}/search-attributes`);
});
