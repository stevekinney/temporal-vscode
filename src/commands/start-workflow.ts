import { Command } from '$components/command';
import { Webview } from '$components/webview';

/**
 * @summary Start a new workflow
 * @description This command opens a webview to start a new workflow.
 */
Command.register('startWorkflow', async () => {
  new Webview('Start Workflow', { html: 'start-workflow' });
});
