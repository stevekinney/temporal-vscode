import { Uri, WebviewPanel } from 'vscode';

const getUri = (panel: WebviewPanel, extensionId: Uri, ...path: string[]) => {
  return panel.webview.asWebviewUri(Uri.joinPath(extensionId, 'dist', ...path));
};

export const getWebviewHtml = async (panel: WebviewPanel, extensionId: Uri) => {
  const scriptUrl = getUri(panel, extensionId, 'index.js');
  const styleUri = getUri(panel, extensionId, 'style.css');

  return `
  <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${panel.webview.cspSource} https:; script-src ${panel.webview.cspSource}; style-src ${panel.webview.cspSource};">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="${styleUri}" rel="stylesheet">
    </head>
    <body>
      <div id="root"></div>
      <script type="module" src="${scriptUrl}"></script>
    </body>
    </html>
  `;
};
