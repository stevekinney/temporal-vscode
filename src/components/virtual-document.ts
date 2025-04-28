import * as vscode from 'vscode';
import { configuration } from '$utilities/configuration';

export interface VirtualDocumentOptions {
  scheme?: string;
  format?: string;
  column?: vscode.ViewColumn;
  indentation?: number;
}

class VirtualJsonDocumentProvider
  implements vscode.TextDocumentContentProvider
{
  private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
  private _disposable: vscode.Disposable;
  private _cache = new Map<string, { content: string; timestamp: number }>();
  private _cacheTTL = 30000; // 30 seconds cache TTL

  constructor(readonly scheme: string = ApiResponse.scheme) {
    this._disposable = vscode.workspace.registerTextDocumentContentProvider(
      scheme,
      this,
    );
  }

  public async provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
    try {
      const cacheKey = uri.toString();
      const cachedContent = this._cache.get(cacheKey);
      const now = Date.now();

      // Return cached content if still valid
      if (cachedContent && now - cachedContent.timestamp < this._cacheTTL) {
        return cachedContent.content;
      }

      const location = new URL(uri.path, configuration.ui.href);
      const response = await fetch(location.href, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }

      const jsonData = await response.json();
      const formattedContent = JSON.stringify(jsonData, null, 2);

      // Cache the result
      this._cache.set(cacheKey, {
        content: formattedContent,
        timestamp: now,
      });

      return formattedContent;
    } catch (error) {
      return JSON.stringify(
        {
          error: true,
          message: error instanceof Error ? error.message : String(error),
        },
        null,
        2,
      );
    }
  }

  get onDidChange(): vscode.Event<vscode.Uri> {
    return this._onDidChange.event;
  }

  public update(uri: vscode.Uri): void {
    this._cache.delete(uri.toString());
    this._onDidChange.fire(uri);
  }

  public clearCache(): void {
    this._cache.clear();
  }

  public dispose(): void {
    this._disposable.dispose();
    this._onDidChange.dispose();
    this._cache.clear();
  }
}

/**
 * Creates a virtual document with the JSON content of the specified API route.
 */
export class ApiResponse {
  static scheme = 'temporal';
  static provider: VirtualJsonDocumentProvider =
    new VirtualJsonDocumentProvider(ApiResponse.scheme);

  /**
   * Show a virtual JSON document.
   * @param uri The URI of the API route to show.
   * @param options Optional settings for the document display
   * @returns The virtual JSON document.
   * @example
   * ```typescript
   * ApiResponse.show('cluster-info');
   * ```
   */
  static show(
    uri: APIRoute[keyof APIRoute],
    options?: Partial<VirtualDocumentOptions>,
  ): ApiResponse {
    const document = new ApiResponse(uri, options);
    document.show();
    return document;
  }

  /**
   * Refresh all open API response documents.
   */
  static refreshAll(): void {
    vscode.workspace.textDocuments
      .filter((doc) => doc.uri.scheme === ApiResponse.scheme)
      .forEach((doc) => ApiResponse.provider.update(doc.uri));
  }

  public column: vscode.ViewColumn;
  public format: string;

  constructor(
    private readonly _uri: APIRoute[keyof APIRoute],
    options?: Partial<VirtualDocumentOptions>,
  ) {
    this.column = options?.column ?? vscode.ViewColumn.Beside;
    this.format = options?.format ?? 'json';
  }

  /**
   * Show the virtual JSON document.
   * @returns Promise that resolves when the document is shown
   */
  async show(): Promise<vscode.TextEditor | undefined> {
    try {
      const uri = this.uri;

      // Check if the document is already open
      const existingDocument = vscode.workspace.textDocuments.find(
        (doc) => doc.uri.toString() === uri.toString(),
      );

      if (existingDocument) {
        // Refresh the document content if it's already open
        ApiResponse.provider.update(uri);

        // Find and show the editor for this document
        const editor = vscode.window.visibleTextEditors.find(
          (editor) => editor.document.uri.toString() === uri.toString(),
        );

        if (editor) {
          return vscode.window.showTextDocument(
            editor.document,
            editor.viewColumn,
          );
        }

        return vscode.window.showTextDocument(existingDocument, this.column);
      } else {
        // Open the document if it's not already open
        const document = await vscode.workspace.openTextDocument(uri);
        vscode.languages.setTextDocumentLanguage(document, this.format);
        return vscode.window.showTextDocument(document, this.column);
      }
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to open document: ${error instanceof Error ? error.message : String(error)}`,
      );
      return undefined;
    }
  }

  /**
   * Refresh the content of this document
   */
  refresh(): void {
    ApiResponse.provider.update(this.uri);
  }

  /**
   * Get the URI for this API response
   */
  get uri(): vscode.Uri {
    return vscode.Uri.parse(
      `${ApiResponse.scheme}://${configuration.ui.host}/api/v1/${this._uri}`,
    );
  }
}
