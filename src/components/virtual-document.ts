import * as vscode from 'vscode';
import { configuration } from '$utilities/configuration';

class VirtualJsonDocumentProvider
  implements vscode.TextDocumentContentProvider
{
  private _onDidChange = new vscode.EventEmitter<vscode.Uri>();

  constructor(scheme: string = VirtualJsonDocument.scheme) {
    vscode.workspace.registerTextDocumentContentProvider(scheme, this);
  }

  public async provideTextDocumentContent(uri: vscode.Uri) {
    const location = new URL(uri.path, configuration.ui.href);
    const response = await fetch(location.href);

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return JSON.stringify(await response.json(), null, 2);
  }

  get onDidChange(): vscode.Event<vscode.Uri> {
    return this._onDidChange.event;
  }

  public update(uri: vscode.Uri) {
    this._onDidChange.fire(uri);
  }
}

/**
 * Creates a virtual document with the JSON content of the specified API route.
 */
export class VirtualJsonDocument {
  static scheme = 'temporal';
  static provider: VirtualJsonDocumentProvider =
    new VirtualJsonDocumentProvider(VirtualJsonDocument.scheme);

  /**
   * Show a virtual JSON document.
   * @param uri The URI of the API route to show.
   * @returns The virtual JSON document.
   * @example
   * ```typescript
   * VirtualJsonDocument.show('cluster-info');
   * ```
   */
  static show(uri: APIRoute[keyof APIRoute]) {
    const document = new VirtualJsonDocument(uri);
    document.show();
    return document;
  }

  public column: vscode.ViewColumn = vscode.ViewColumn.Beside;
  public format: string = 'json';

  constructor(private readonly _uri: APIRoute[keyof APIRoute]) {}

  /**
   * Show the virtual JSON document.
   */
  async show() {
    const uri = this.uri;

    // Check if the document is already open
    const existingDocument = vscode.workspace.textDocuments.find(
      (doc) => doc.uri.toString() === uri.toString(),
    );

    console.log({ existingDocument });

    if (existingDocument) {
      // Refresh the document content if it's already open
      VirtualJsonDocument.provider.update(uri);
    } else {
      // Open the document if it's not already open
      const document = await vscode.workspace.openTextDocument(uri);
      vscode.languages.setTextDocumentLanguage(document, this.format);
      vscode.window.showTextDocument(document, this.column);
    }
  }

  get uri() {
    return vscode.Uri.parse(
      `${VirtualJsonDocument.scheme}://${configuration.ui.host}/api/v1/${this._uri}`,
    );
  }
}
