import { CommandRegistration } from './command-registration';

/**
 * Write a markdown file with the command documentation.
 */
export async function generateCommandDocumentation(
  commands: CommandRegistration[],
  filePath = 'src/commands/README.md',
) {
  await Bun.write(filePath, '');
  const file = Bun.file(filePath);
  const writer = file.writer();

  writer.write('# Commands\n');
  writer.write(
    '<!-- This file is generated. Do not edit. Run `bun run generate:commands`. -->',
  );

  writer.write(`\n\n`);

  for (const command of commands) {
    writer.write(`## ${command.name}`);
    writer.write(`\n\n`);
    writer.write(`${command.title}.`);
    writer.write(`\n\n`);
  }

  await writer.end();
}
