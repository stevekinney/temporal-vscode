import * as vscode from 'vscode';
import { toCommandName } from '$components/command';

export type StatusBarItemParameters = {
  id: string;
  alignment?: vscode.StatusBarAlignment;
  priority?: number;
  tooltip?: string;
  text?: string;
  command?: CommandName;
  color?: vscode.ThemeColor;
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
    color,
    command,
  }: StatusBarItemParameters) {
    this.item = vscode.window.createStatusBarItem(id, alignment, priority);

    if (tooltip) {
      this.item.tooltip = tooltip;
    }

    if (text) {
      this.item.text = text;
    }

    if (color) {
      this.item.color = color;
    }

    if (command) {
      this.item.command = toCommandName(command);
    }

    StatusBarItem.items.push(this);
    StatusBarItem.context.subscriptions.push(this.item);
  }

  get id(): string {
    return this.item.id;
  }

  get text(): string {
    return this.item.text;
  }

  set text(value: string) {
    this.item.text = value;
  }

  get tooltip() {
    return this.item.tooltip;
  }

  set tooltip(value: typeof this.item.tooltip) {
    this.item.tooltip = value;
  }

  get color() {
    return this.item.color;
  }

  set color(value: typeof this.item.color) {
    this.item.color = value;
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

export class StatusBarItemGroup {
  items: StatusBarItem[];

  static create(items: StatusBarItemParameters[]): StatusBarItemGroup {
    return new StatusBarItemGroup(items);
  }

  constructor(items: StatusBarItemParameters[]) {
    const statusBarItems = items.map(StatusBarItem.create);
    this.items = statusBarItems;
  }

  update(parameters: StatusBarItemParameters[]): void {
    parameters.forEach((parameter) => {
      const item = this.items.find((item) => item.id === parameter.id);

      if (item) {
        if (parameter.tooltip) {
          item.tooltip = parameter.tooltip;
        }

        if (parameter.text) {
          item.text = parameter.text;
        }

        if (parameter.color) {
          item.color = parameter.color;
        }
      }
    });
  }

  show(): void {
    this.items.forEach((item) => item.show());
  }

  hide(): void {
    this.items.forEach((item) => item.hide());
  }

  dispose(): void {
    this.items.forEach((item) => item.dispose());
  }

  setInterval(callback: () => void, interval: number): void {
    this.items.forEach((item) => item.setInterval(callback, interval));
  }

  clearInterval(): void {
    this.items.forEach((item) => item.clearInterval());
  }
}
