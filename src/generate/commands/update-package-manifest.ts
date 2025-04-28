import pkg from 'package.json' assert { type: 'json' };

import { formatContent } from 'src/utilities/format-file';
import { CommandRegistration } from './command-registration';

/**
 * Updates the package.json file with the commands.
 * @param {CommandRegistration[]} commands - The commands to add to the package.json file.
 */
export async function updatePackageManifest(commands: CommandRegistration[]) {
  pkg.contributes.commands = commands.map((command) => command.toJSON());

  await Bun.write(
    'package.json',
    await formatContent(JSON.stringify(pkg, null, 2), 'json'),
  );
}
