# Temporal Visual Studio Code Plugin

This is pre-release software. Use at your own risk. ☠️

## Getting Started

- Install the dependencies using `bun install`.
- Open the project in Visual Studio Code.
- Press `F5` to build the extension. This will launch a second editor with the extension loaded in.
- If you make any changes, refresh the project running the extension using `Command-R`.

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

### Generating Configuration

You can generate types and schemas for the configuration defined in `package.json` by running `bun run generate:configuration`. This script looks at the configuration supported in `contributes.configuration.properties` in `package.json` and creates types and schemas in `src/utilities/configuration-schema.ts`.

### Generating Types

You can generate types based off the extension configuration by running `bun run generate:types`. Right now, this simply takes the the name of the extension from `package.json` and creates the `ExtensionId` type in `src/types.d.ts`, but it may be expanded in the future.
