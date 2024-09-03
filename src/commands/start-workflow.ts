import { Command } from '$components/command';
import { Webview } from '$components/webview';

/**
 * @summary Start workflow
 */
Command.register('startWorkflow', async () => {
  Webview.show('Start Workflow');
});
