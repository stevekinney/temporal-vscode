import * as vscode from 'vscode';
import { toCommandName } from '$components/command';

/**
 * Parameters for creating status bar items
 */
export interface StatusBarItemParameters {
  id: string;
  alignment?: vscode.StatusBarAlignment;
  priority?: number;
  tooltip?: string;
  text?: string;
  command?: CommandName | (() => void | Promise<void>);
  color?: string | vscode.ThemeColor;
  backgroundColor?: vscode.ThemeColor;
  name?: string;
}

/**
 * A wrapper around vscode.StatusBarItem with additional functionality
 */
export class StatusBarItem implements vscode.Disposable {
  static context: vscode.ExtensionContext;
  static readonly items: StatusBarItem[] = [];

  /**
   * Creates a new status bar item with the given parameters
   * @param parameters The parameters to create the status bar item with
   * @returns A new StatusBarItem instance
   */
  static create(parameters: StatusBarItemParameters): StatusBarItem {
    const existing = StatusBarItem.get(parameters.id);
    if (existing) {
      existing.update(parameters);
      return existing;
    }
    return new StatusBarItem(parameters);
  }

  /**
   * Gets a status bar item by ID
   * @param id The ID of the status bar item to find
   * @returns The status bar item or undefined if not found
   */
  static get(id: string): StatusBarItem | undefined {
    return this.items.find((item) => item.id === id);
  }

  /**
   * Disposes a status bar item by ID
   * @param id The ID of the status bar item to dispose
   */
  static dispose(id: string): void {
    const index = this.items.findIndex((item) => item.id === id);
    if (index !== -1) {
      this.items[index].dispose();
      this.items.splice(index, 1);
    }
  }

  /**
   * Disposes all status bar items
   */
  static disposeAll(): void {
    this.items.forEach((item) => item.dispose());
    this.items.length = 0;
  }

  private readonly _item: vscode.StatusBarItem;
  private _interval: NodeJS.Timer | undefined = undefined;
  private _disposed: boolean = false;
  private _commandHandler: vscode.Disposable | undefined = undefined;
  private _commandCallback: (() => void | Promise<void>) | undefined =
    undefined;

  constructor(parameters: StatusBarItemParameters) {
    const {
      id,
      alignment = vscode.StatusBarAlignment.Left,
      priority = 0,
    } = parameters;

    this._item = vscode.window.createStatusBarItem(id, alignment, priority);
    this.update(parameters);

    StatusBarItem.items.push(this);
    StatusBarItem.context.subscriptions.push(this);
  }

  /**
   * Updates the status bar item with new parameters
   * @param parameters The parameters to update
   * @returns This status bar item for chaining
   */
  update(parameters: Partial<StatusBarItemParameters>): StatusBarItem {
    try {
      const { tooltip, text, color, backgroundColor, command } = parameters;

      if (tooltip !== undefined) {
        this._item.tooltip = tooltip;
      }

      if (text !== undefined) {
        this._item.text = text;
      }

      if (color !== undefined) {
        this._item.color = color;
      }

      if (backgroundColor !== undefined) {
        this._item.backgroundColor = backgroundColor;
      }

      if (command !== undefined) {
        this.setCommand(command);
      }

      return this;
    } catch (error) {
      console.error(`Failed to update status bar item ${this.id}:`, error);
      return this;
    }
  }

  /**
   * Sets the command for this status bar item
   * @param command The command to execute when the status bar item is clicked
   * @returns This status bar item for chaining
   */
  private setCommand(
    command: CommandName | (() => void | Promise<void>),
  ): StatusBarItem {
    // Clean up any existing command handler
    if (this._commandHandler) {
      this._commandHandler.dispose();
      this._commandHandler = undefined;
      this._commandCallback = undefined;
    }

    if (typeof command === 'string') {
      // Set the standard command name
      this._item.command = toCommandName(command);
    } else if (typeof command === 'function') {
      // Create a unique command ID for this callback
      const commandId = `statusBarItem.${this.id}.command`;
      this._commandCallback = command;

      // Register the command
      this._commandHandler = vscode.commands.registerCommand(
        commandId,
        async () => {
          try {
            if (this._commandCallback) {
              await this._commandCallback();
            }
          } catch (error) {
            console.error(
              `Error executing status bar command for ${this.id}:`,
              error,
            );
          }
        },
      );

      // Add to extension subscriptions
      StatusBarItem.context.subscriptions.push(this._commandHandler);

      // Set the command
      this._item.command = commandId;
    }

    return this;
  }

  /**
   * Gets the ID of this status bar item
   */
  get id(): string {
    return this._item.id;
  }

  /**
   * Gets the text of this status bar item
   */
  get text(): string {
    return this._item.text;
  }

  /**
   * Sets the text of this status bar item
   */
  set text(value: string) {
    if (!this._disposed) {
      this._item.text = value;
    }
  }

  /**
   * Gets the tooltip of this status bar item
   */
  get tooltip() {
    return this._item.tooltip;
  }

  /**
   * Sets the tooltip of this status bar item
   */
  set tooltip(value: typeof this._item.tooltip) {
    if (!this._disposed) {
      this._item.tooltip = value;
    }
  }

  /**
   * Gets the color of this status bar item
   */
  get color() {
    return this._item.color;
  }

  /**
   * Sets the color of this status bar item
   */
  set color(value: typeof this._item.color) {
    if (!this._disposed) {
      this._item.color = value;
    }
  }

  /**
   * Gets the background color of this status bar item
   */
  get backgroundColor() {
    return this._item.backgroundColor;
  }

  /**
   * Sets the background color of this status bar item
   */
  set backgroundColor(value: vscode.ThemeColor | undefined) {
    if (!this._disposed) {
      this._item.backgroundColor = value;
    }
  }

  /**
   * Shows the status bar item
   * @returns This status bar item for chaining
   */
  show(): StatusBarItem {
    if (!this._disposed) {
      this._item.show();
    }
    return this;
  }

  /**
   * Hides the status bar item
   * @returns This status bar item for chaining
   */
  hide(): StatusBarItem {
    if (!this._disposed) {
      this._item.hide();
    }
    return this;
  }

  /**
   * Disposes the status bar item and cleans up resources
   */
  dispose(): void {
    if (!this._disposed) {
      this.clearInterval();

      if (this._commandHandler) {
        this._commandHandler.dispose();
        this._commandHandler = undefined;
      }

      this._item.dispose();
      this._disposed = true;

      // Remove from items array
      const index = StatusBarItem.items.indexOf(this);
      if (index !== -1) {
        StatusBarItem.items.splice(index, 1);
      }
    }
  }

  /**
   * Sets an interval for updating this status bar item
   * @param callback The function to call on the interval
   * @param interval The interval in milliseconds
   * @returns This status bar item for chaining
   */
  setInterval(callback: () => void, interval: number): StatusBarItem {
    this.clearInterval();
    if (!this._disposed) {
      this._interval = setInterval(callback, interval);
    }
    return this;
  }

  /**
   * Clears the update interval for this status bar item
   * @returns This status bar item for chaining
   */
  clearInterval(): StatusBarItem {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = undefined;
    }
    return this;
  }
}

/**
 * A group of status bar items that can be managed together
 */
export class StatusBarItemGroup implements vscode.Disposable {
  private _items: StatusBarItem[] = [];
  private _disposed: boolean = false;

  /**
   * Creates a new status bar item group with the given parameters
   * @param items The parameters for the status bar items
   * @returns A new StatusBarItemGroup instance
   */
  static create(items: StatusBarItemParameters[]): StatusBarItemGroup {
    return new StatusBarItemGroup(items);
  }

  /**
   * Creates a new status bar item group
   * @param items The parameters for the status bar items
   */
  constructor(items: StatusBarItemParameters[]) {
    this._items = items.map(StatusBarItem.create);
  }

  /**
   * Gets the status bar items in this group
   */
  get items(): readonly StatusBarItem[] {
    return this._items;
  }

  /**
   * Adds a status bar item to this group
   * @param item The status bar item to add
   * @returns This status bar item group for chaining
   */
  add(item: StatusBarItem | StatusBarItemParameters): StatusBarItemGroup {
    if (!this._disposed) {
      const statusBarItem =
        item instanceof StatusBarItem ? item : StatusBarItem.create(item);

      // Avoid duplicates
      if (!this._items.some((i) => i.id === statusBarItem.id)) {
        this._items.push(statusBarItem);
      }
    }
    return this;
  }

  /**
   * Removes a status bar item from this group
   * @param id The ID of the status bar item to remove
   * @returns This status bar item group for chaining
   */
  remove(id: string): StatusBarItemGroup {
    if (!this._disposed) {
      const index = this._items.findIndex((item) => item.id === id);
      if (index !== -1) {
        this._items.splice(index, 1);
      }
    }
    return this;
  }

  /**
   * Updates status bar items in this group
   * @param parameters The parameters to update
   * @returns This status bar item group for chaining
   */
  update(parameters: Partial<StatusBarItemParameters>[]): StatusBarItemGroup {
    if (!this._disposed) {
      parameters.forEach((parameter) => {
        if (!parameter.id) {
          return;
        }

        const item = this._items.find((item) => item.id === parameter.id);
        if (item) {
          item.update(parameter);
        }
      });
    }
    return this;
  }

  /**
   * Shows all status bar items in this group
   * @returns This status bar item group for chaining
   */
  show(): StatusBarItemGroup {
    if (!this._disposed) {
      this._items.forEach((item) => item.show());
    }
    return this;
  }

  /**
   * Hides all status bar items in this group
   * @returns This status bar item group for chaining
   */
  hide(): StatusBarItemGroup {
    if (!this._disposed) {
      this._items.forEach((item) => item.hide());
    }
    return this;
  }

  /**
   * Disposes all status bar items in this group
   */
  dispose(): void {
    if (!this._disposed) {
      this._items.forEach((item) => item.dispose());
      this._items = [];
      this._disposed = true;
    }
  }

  /**
   * Sets an interval for updating all status bar items in this group
   * @param callback The function to call on the interval
   * @param interval The interval in milliseconds
   * @returns This status bar item group for chaining
   */
  setInterval(callback: () => void, interval: number): StatusBarItemGroup {
    if (!this._disposed) {
      this._items.forEach((item) => item.setInterval(callback, interval));
    }
    return this;
  }

  /**
   * Clears the update interval for all status bar items in this group
   * @returns This status bar item group for chaining
   */
  clearInterval(): StatusBarItemGroup {
    if (!this._disposed) {
      this._items.forEach((item) => item.clearInterval());
    }
    return this;
  }
}
