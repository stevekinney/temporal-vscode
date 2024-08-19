import { html, render } from '$utilities/html';
import { Command } from '$components/command';
import { Webview } from '$components/webview';

const webview = new Webview('startWorkflow', 'Start Workflow');

/**
 * @summary Start workflow
 */
Command.register('startWorkflow', async () => {
  webview.content = html`<h2>Start Workflow</h2>`;
  webview.show();
});
