import { CommandRegistration } from './command-registration';
import { formatContent } from 'src/utilities/format-file';

/**
 * Writes a TypeScript file with the command types.
 */
export async function writeCommandTypes(
  commands: CommandRegistration[],
  filePath = 'src/commands.d.ts',
) {
  const content = `
  // This file is generated. Do not edit.
  // Run \`bun run generate:commands\` to update this file.

  type CommandName = ${commands
    .map((command) => `'${command.name}'`)
    .join(' | ')};

  type FullCommandName = \`\${ExtensionId}.\${CommandName}\`;
  `;

  await Bun.write(filePath, await formatContent(content));
}
