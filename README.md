# Temporal Visual Studio Code Plugin

This is pre-release software. Use at your own risk. ☠️

## Getting Started

- Install the dependencies using `bun install`.
- Open the project in Visual Studio Code.
- Press `F5` to build the extension. This will launch a second editor with the extension loaded in.
- If you make any changes, refresh the project running the extension using `Command-R`.

## Architecture

The Temporal VS Code extension follows a well-structured architecture designed for maintainability and extensibility.

### Component-Based Design

- Built around a central `Component` class that provides access to VS Code's extension context
- Uses a singleton pattern for extension context sharing
- All major components extend this base class

### Command Registration System

- Uses a factory pattern with `Command.register` to create and register commands
- Provides consistent error handling and resource management
- Commands receive pre-configured utilities (getClient, withClient, openUI, context)

### Client Utilities

- Provides abstracted client creation through `createClient` and `withClient` functions
- Automatically manages client connections and cleanup
- Handles server verification and prompts to start development server if needed

### Server Management

- Includes a development server component that can start/stop a Temporal server
- Uses `Terminal` component for server process management
- Checks port availability before starting server

## Command Registration System

The extension uses a specialized `Command.register` method that streamlines the process of adding new commands. This system provides several benefits:

### Key Features and Benefits

#### Simplified Command Registration

```typescript
/**
 * @summary View workflows
 */
Command.register('viewWorkflows', ({ openUI }) => {
  return openUI('workflows');
});
```

#### Automatic Utilities Injection

Each command handler receives a parameters object with the following utilities:

- `context`: VS Code extension context
- `getClient`: Function to get a Temporal client
- `withClient`: Function to use a Temporal client with automatic cleanup
- `openUI`: Function to open Temporal web UI

#### Resource Management

- Automatically manages client connections
- Proper cleanup of resources when commands complete
- Consistent error handling across all commands

#### Code Generation Integration

- Command documentation is generated from JSDoc comments
- Commands are automatically registered in package.json
- TypeScript types are generated for command names

### Adding a New Command

To add a new command to the extension:

1. Create a command handler in an appropriate file in the `commands` directory
2. Use JSDoc with `@summary` to provide a description (used for VS Code UI)
3. Register the command using `Command.register`
4. Run `bun run generate:commands` to update package.json and type definitions

```typescript
/**
 * @summary List all namespaces
 */
Command.register('listNamespaces', async ({ withClient }) => {
  await withClient(async (client) => {
    const result = await client.workflowService.listNamespaces({});
    // Display namespaces...
  });
});
```

## Components

### Webviews

`Webview` provides a wrapper around VS Code's terminal API with enhanced functionality and support for loading React components.

```ts
import { Command } from '$components/command';
import { Webview } from '$components/webview';

/**
 * @summary Start a new workflow
 * @description This command opens a webview to start a new workflow.
 */
Command.register('startWorkflow', async () => {
  new Webview('Start Workflow', { component: 'start-workflow' });
});
```

This will go looking for a React component in `src/webviews/start-workflow.tsx`.

```tsx
import React from 'react';

export default function startWorkflow() {
  return <p>Start Workflow</p>;
}
```

This file must export the component as its default export.

### Terminal

`Terminal` provides a wrapper around VS Code's terminal API with enhanced functionality:

```typescript
// Create and use a terminal
const terminal = new Terminal('Temporal Server');
terminal.show().sendText('command to run');
```

- Terminal lifecycle management (creation, reuse, disposal)
- Chainable API for common operations
- Error handling and terminal session tracking
- Methods for sending text, cancellation signals, and clearing content
- Event handling for terminal open/close events

### Virtual Document

`ApiResponse` (in [`src/components/virtual-document.ts`](./src/components/virtual-document.ts)) creates and manages virtual documents to display API responses:

```typescript
// Display an API response in a VS Code editor
ApiResponse.show('cluster-info');
```

- Fetches and displays Temporal API responses as virtual documents
- Content caching with automatic refresh
- Document formatting (JSON)
- Handles document reuse and updates
- Error handling for API failures

### Status Bar Items

The `StatusBarItem` and `StatusBarItemGroup` classes provide enhanced status bar functionality:

```typescript
// Create a status bar item
const item = StatusBarItem.create({
  id: 'temporal.serverStatus',
  text: 'Temporal: $(check)',
  tooltip: 'Temporal server is running',
  command: 'startDevelopmentServer',
});
```

- Factory methods for creating and managing status bar items
- Command registration for click handlers (with string command names or function callbacks)
- Interval-based updates
- Grouping multiple status bar items for collective management
- Chainable API for common operations
- Proper resource disposal

## Code Generation

A lot of the configuration for a Visual Studio Code plugin is defined in `package.json`. It can be a bit tedious to keep this in sync with the code of the extension itself. A number of code generation tools are included in order to make this a bit easy.

To run _all_ of the commands below:

```sh
bun run generate
```

This will run each of the scripts below.

### Generating Commands

This script searches the code base for all invocations of `Command.register` and adds them to `package.json`. It will also create a `CommandNames` type in `src/commands.d.ts`.

The manifest of commands in `package.json` and the `CommandNames` type in `src/commands.d.ts` should be generated using `bun run generate:commands`. Do _not_ edit either of these files directly.

You can see a list of all supported commands [here](./src/commands/README.md).

### Generating Configuration

You can generate types and schemas for the configuration defined in `package.json` by running `bun run generate:configuration`. This script looks at the configuration supported in `contributes.configuration.properties` in `package.json` and creates types and schemas in `src/utilities/configuration-schema.ts`.

### Generating Types

You can generate types based off the extension configuration by running `bun run generate:types`. Right now, this simply takes the the name of the extension from `package.json` and creates the `ExtensionId` type in `src/types.d.ts`, but it may be expanded in the future.
