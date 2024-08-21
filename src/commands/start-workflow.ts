import { Command } from '$components/command';
import { Webview } from '$components/webview';

/**
 * @summary Start workflow
 */
Command.register('startWorkflow', async () => {
  const webview = new Webview('start-workflow', 'Start Workflow');
  webview.show();
});
