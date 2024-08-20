import * as vscode from 'vscode';

type StatusBarItemParameters = {
  id: string;
  alignment?: vscode.StatusBarAlignment;
  priority?: number;
  tooltip?: string;
  text?: string;
  command?: CommandName;
};

export class StatusBarItem implements vscode.Disposable {
  static context: vscode.ExtensionContext;
  static readonly items: StatusBarItem[] = [];

  static create(parameters: StatusBarItemParameters): StatusBarItem {
    return new StatusBarItem(parameters);
  }

  static get(id: string): StatusBarItem | undefined {
    return this.items.find((item) => item.id === id);
  }

  static dispose(id: string): void {
    const item = this.get(id);

    if (item) {
      item.dispose();
    }
  }

  static disposeAll(): void {
    this.items.forEach((item) => item.dispose());
    this.items.length = 0;
  }

  private readonly item;
  private interval: NodeJS.Timeout | undefined = undefined;

  constructor({
    id,
    alignment,
    priority,
    tooltip,
    text,
  }: StatusBarItemParameters) {
    this.item = vscode.window.createStatusBarItem(id, alignment, priority);

    if (tooltip) {
      this.item.tooltip = tooltip;
    }

    if (text) {
      this.item.text = text;
    }

    StatusBarItem.items.push(this);
    StatusBarItem.context.subscriptions.push(this.item);
  }

  get id(): string {
    return this.item.id;
  }

  set text(value: string) {
    this.item.text = value;
  }

  show(): void {
    this.item.show();
  }

  hide(): void {
    this.item.hide();
  }

  dispose(): void {
    this.item.dispose();
    this.clearInterval();
  }

  setInterval(callback: () => void, interval: number): void {
    this.clearInterval();
    this.interval = setInterval(callback, interval);
  }

  clearInterval(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  }
}
